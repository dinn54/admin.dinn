import { supabase } from "./supabase";
import { Database } from "./database.types";
import { unstable_cache } from "next/cache";
import {
  ShoppingBasket01Icon,
  CheckListIcon,
  LaptopIcon,
  BookOpen01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

export interface Service extends Omit<ServiceRow, "icon"> {
  icon: any; // Changed from string to any (React Component) for UI
}

export interface Activity {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  status: Database["public"]["Enums"]["ActivityStatus"];
}

const getServicesCached = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching services:", error.message);
      return [];
    }

    // Icon mapping logic
    return data.map((item) => {
      let IconComponent = Layers01Icon;
      if (item.name.toLowerCase().includes("studymate"))
        IconComponent = BookOpen01Icon;
      else if (item.name.toLowerCase().includes("dinn"))
        IconComponent = LaptopIcon;

      return {
        ...item,
        icon: IconComponent,
      };
    });
  },
  ["services"],
  { tags: ["table:services"] }
);

export async function getServices() {
  return getServicesCached();
}

const getRecentActivitiesCached = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.warn("Error fetching activities:", error.message);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      timestamp: new Date(item.created_at).toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: item.action_type,
      target: item.target_resource,
      status: item.status,
    }));
  },
  ["activities"],
  { tags: ["table:activities"] }
);

export async function getRecentActivities() {
  return getRecentActivitiesCached();
}

const getSummaryStatsCached = unstable_cache(
  async () => {
    const [totalResult, activeResult] = await Promise.all([
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("status", "Active"),
    ]);

    return [
      {
        title: "전체 서비스",
        value: totalResult.count || 0,
        icon: ShoppingBasket01Icon,
        description: "전체 등록된 서비스",
      },
      {
        title: "활성 서비스",
        value: activeResult.count || 0,
        icon: CheckListIcon,
        description: "현재 운영 중",
      },
    ];
  },
  ["services-summary"],
  { tags: ["table:services"] }
);

export async function getSummaryStats() {
  return getSummaryStatsCached();
}

export async function getServiceFeatures(serviceId: string) {
  const cached = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("service_features")
        .select("*")
        .eq("service_id", serviceId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("Error fetching service features:", error.message);
        return [];
      }

      return data;
    },
    ["service-features", serviceId],
    { tags: ["table:service_features"] }
  );
  return cached();
}

export async function getServiceById(serviceId: string) {
  const cached = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error) {
        console.warn("Error fetching service:", error.message);
        return null;
      }

      return data;
    },
    ["service-by-id", serviceId],
    { tags: ["table:services"] }
  );
  return cached();
}

export async function getServiceByName(serviceName: string) {
  const cached = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .ilike("name", serviceName)
        .single();

      if (error) {
        console.warn("Error fetching service by name:", error.message);
        return null;
      }

      return data;
    },
    ["service-by-name", serviceName],
    { tags: ["table:services"] }
  );
  return cached();
}

export async function getServiceFeatureBySlug(serviceId: string, slug: string) {
  const cached = unstable_cache(
    async () => {
      // Try matching with and without leading slash
      const paths = [`/${slug}`, slug];

      const { data, error } = await supabase
        .from("service_features")
        .select("*")
        .eq("service_id", serviceId)
        .in("path", paths) // Check both /slug and slug
        .single();

      if (error) {
        console.warn(`Error fetching feature by slug (${slug}):`, error.message);
        return null;
      }

      return data;
    },
    ["service-feature-by-slug", serviceId, slug],
    { tags: ["table:service_features"] }
  );
  return cached();
}

export async function fetchTableData<T = any>(tableName: string) {
  const cached = unstable_cache(
    async () => {
      // Allow querying any table dynamically using the table name string
      //dinpost row type
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          `Error fetching data from table ${tableName}:`,
          error.message
        );
        return [];
      }

      return data as T[];
    },
    ["table-data", tableName],
    { tags: [`table:${tableName}`] }
  );

  return cached();
}
// ... existing functions

export async function fetchRowByColumn<T = any>(
  tableName: string,
  column: string,
  value: string
) {
  const cached = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .eq(column, value)
        .single();

      if (error) {
        console.warn(
          `Error fetching row from ${tableName} where ${column}=${value}:`,
          error.message
        );
        return null;
      }

      return data as T;
    },
    ["row-by-column", tableName, column, value],
    { tags: [`table:${tableName}`] }
  );

  return cached();
}
// ... existing functions

export async function fetchAdjacentRows<T = any>(
  tableName: string,
  currentId: string
) {
  const cached = unstable_cache(
    async () => {
      // 1. Get current row's created_at
      const currentResult = (await supabase
        .from(tableName as any)
        .select("created_at")
        .eq("id", currentId)
        .single()) as { data: { created_at: string } | null; error: any };

      const currentCreatedAt = currentResult?.data?.created_at;

      if (!currentCreatedAt) {
        return { prev: null, next: null };
      }

      const { data: prevData, error: prevError } = await supabase
        .from(tableName as any)
        .select("id, title")
        .lt("created_at", currentCreatedAt)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: nextData, error: nextError } = await supabase
        .from(tableName as any)
        .select("id, title")
        .gt("created_at", currentCreatedAt)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      return {
        prev: prevError ? null : (prevData as T),
        next: nextError ? null : (nextData as T),
      };
    },
    ["adjacent-rows", tableName, currentId],
    { tags: [`table:${tableName}`] }
  );

  return cached();
}
