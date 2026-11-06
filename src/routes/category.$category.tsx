import { createFileRoute, notFound } from "@tanstack/react-router";
import { Index, Route as HomeRoute } from "./index";
export const Route = createFileRoute("/category/$category")({
  validateSearch: HomeRoute.options.validateSearch,
  beforeLoad: ({ params }) => {
    if (!["sheets", "towels", "crockery", "household", "gadgets"].includes(params.category))
      throw notFound();
  },
  component: CategoryPage,
});
function CategoryPage() {
  const { category } = Route.useParams();
  const name = category === "gadgets" ? "Household" : category[0].toUpperCase() + category.slice(1);
  return <Index fixedCategory={name} />;
}
