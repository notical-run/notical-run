import { useBreakpoint } from '@/utils/use-breakpoint';
import { createContext, Accessor, createSignal, ParentProps, useContext } from 'solid-js';

export const LayoutContext = createContext<{
  sidebarOpen: Accessor<boolean>;
  isFixedSidebar: Accessor<boolean>;
  toggleSidebar: () => void;
}>();

export const useLayoutContext = () => useContext(LayoutContext)!;

export const LayoutProvider = (props: ParentProps) => {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const isFixedSidebar = useBreakpoint('md');

  const isSidebarOpen = () => [sidebarOpen(), isFixedSidebar()].some(Boolean);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen());

  return (
    <LayoutContext.Provider value={{ sidebarOpen: isSidebarOpen, toggleSidebar, isFixedSidebar }}>
      {props.children}
    </LayoutContext.Provider>
  );
};
