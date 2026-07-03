export const ROUTES = {
  home: '/',
  leads: {
    list: '/leads',
    new: '/leads/new',
    detail: (id: string) => `/leads/${id}`,
  },
  tasks: '/tasks',
  templates: '/templates',
  settings: '/settings',
} as const;
