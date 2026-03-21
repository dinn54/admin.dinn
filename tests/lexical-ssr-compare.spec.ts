import { expect, test } from "@playwright/test";

const fixtures = ["user-lexical", "user-markdown", "table-editor"] as const;

function normalizeComparisonHtml(html: string): string {
  return html
    .replace(/\scontenteditable="[^"]*"/g, "")
    .replace(/\sdata-testid="[^"]*"/g, "")
    .replace(/\sdata-fixture="[^"]*"/g, "")
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/\sdir="[^"]*"/g, "")
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(/\sdata-lexical-[^=]+="[^"]*"/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function blockExternalMedia(page: import("@playwright/test").Page) {
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (
      url.includes("images.unsplash.com") ||
      url.includes("octodex.github.com") ||
      url.includes("youtube.com/embed/") ||
      url.includes("platform.twitter.com") ||
      url.includes("twimg.com") ||
      url.includes("x.com")
    ) {
      await route.abort();
      return;
    }

    await route.continue();
  });
}

async function getNormalizedComparisonHtml(page: import("@playwright/test").Page) {
  return normalizeComparisonHtml(
    await page.getByTestId("comparison-root").evaluate((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll("img, iframe, .editor-tweet, .react-tweet-theme")
        .forEach((element) => {
          const removable =
            element.closest("figure") ||
            element.closest(".editor-embed-block") ||
            element.parentElement ||
            element;
          removable.remove();
        });

      const editable = clone.querySelector("[contenteditable]");
      return editable?.innerHTML || clone.innerHTML;
    }),
  );
}

for (const fixture of fixtures) {
  test(`Lexical SSR output matches hydrated client DOM for fixture: ${fixture}`, async ({
    browser,
  }) => {
    const path = `/dev/lexical-ssr-compare?fixture=${fixture}`;

    const ssrContext = await browser.newContext({ javaScriptEnabled: false });
    const ssrPage = await ssrContext.newPage();
    await blockExternalMedia(ssrPage);
    await ssrPage.goto(path, { waitUntil: "domcontentloaded" });
    const ssrHtml = await getNormalizedComparisonHtml(ssrPage);
    await ssrContext.close();

    const hydratedContext = await browser.newContext();
    const hydratedPage = await hydratedContext.newPage();
    await blockExternalMedia(hydratedPage);
    await hydratedPage.goto(path, { waitUntil: "domcontentloaded" });
    await expect(hydratedPage.getByTestId("hydration-marker")).toHaveAttribute(
      "data-hydrated",
      "true",
    );
    const hydratedHtml = await getNormalizedComparisonHtml(hydratedPage);
    await hydratedContext.close();

    expect(hydratedHtml).toBe(ssrHtml);
  });
}
