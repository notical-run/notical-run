import { A } from '@solidjs/router';
import { Accessor, ComponentProps } from 'solid-js';

export const links = {
  workspaces: () => '/workspaces',
  workspaceNotes: (slug: string) => `/${slug}`,
  archivedWorkspaceNotes: (slug: string) => `/${slug}/archived`,
  workspaceNote: (slug: string, noteId: string) => `/@${slug}/${noteId}`,
  login: () => '/login',
  signup: () => '/signup',
  logout: () => '/logout',
};

type AnchorProps = Omit<ComponentProps<typeof A>, 'href'>;

export const makeLink = (link: Accessor<string>) => (props: AnchorProps) => (
  <A href={link()} {...props}>
    {props.children}
  </A>
);

export const Link = {
  Login: makeLink(links.login),
  Signup: makeLink(links.signup),
  Logout: makeLink(links.logout),
  Workspaces: makeLink(links.workspaces),
  WorkspaceNotes: (p: { slug: string } & AnchorProps) =>
    makeLink(() => links.workspaceNotes(p.slug))(p),
  ArchivedWorkspaceNotes: (p: { slug: string } & AnchorProps) =>
    makeLink(() => links.archivedWorkspaceNotes(p.slug))(p),
  Note: (p: { slug: string; noteId: string } & AnchorProps) =>
    makeLink(() => links.workspaceNote(p.slug, p.noteId))(p),
  External: (p: ComponentProps<'a'>) => <a target="_blank" {...p} />,
};
