// `?walkthrough=off` is for whoever already knows the course (a host, a demo, a test): the help button still opens it.
export const walkthroughWanted = (search: string, seen: string | null) => new URLSearchParams(search).get('walkthrough') !== 'off' && seen === null
