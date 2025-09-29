export function getProjectContextFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const pid = urlParams.get("pid");
  const keyMatch = window.location.pathname.match(
    /\/projects\/([A-Z][A-Z0-9]+)\/?/i
  );
  const key = keyMatch ? keyMatch[1] : urlParams.get("projectKey");

  return {
    projectId: pid ? parseInt(pid, 10) : null,
    projectKey: key || null,
  };
}
