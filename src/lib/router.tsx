import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Route = { path: string; params: Record<string, string> };

const RouterContext = createContext<{
  route: Route;
  navigate: (path: string) => void;
} | undefined>(undefined);

function parsePath(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return { path: hash, params: {} };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(parsePath);

  useEffect(() => {
    const onHash = () => {
      setRoute(parsePath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.location.hash = '/';
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
