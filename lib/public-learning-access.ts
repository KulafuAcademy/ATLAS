// Vercel deployments of this branch are open so its preview link can be shared without a login.
// Deployments of any other branch, including main after a merge, keep the staff login. Remove when the review is done.
const PUBLIC_PREVIEW_BRANCH = "main-feat/lesson-page-word-popover";

/** Set PUBLIC_LEARNING_ACCESS=true in the production environment for temporary public learning access. */
export function publicLearningAccessEnabled() {
  return (
    process.env.PUBLIC_LEARNING_ACCESS === "true" ||
    process.env.VERCEL_GIT_COMMIT_REF === PUBLIC_PREVIEW_BRANCH
  );
}
