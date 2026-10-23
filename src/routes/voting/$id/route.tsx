import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/voting/$id")({
  component: VotingElectionLayout,
});

function VotingElectionLayout() {
  return <Outlet />;
}
