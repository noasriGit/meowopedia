import { createPrefixRouteHandlers } from "@/lib/routing/entity-routes";

const handlers = createPrefixRouteHandlers("/facts");

export const revalidate = 86400;
export const generateStaticParams = handlers.generateStaticParams;
export const generateMetadata = handlers.generateMetadata;
export default handlers.Page;
