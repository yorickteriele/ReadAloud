export type Breadcrumb = {
  label: string;
  to: string;
};

function normalizeLabel(value: string) {
  // Remove IDs (guid or numbers) from label if possible, or just capitalize
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return 'Detail';
  }
  
  if (/^\d+$/.test(value)) {
    return 'Item';
  }

  return value
    .split(/[-_/]+/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function buildBreadcrumbs(pathname: string, rootLabel: string, currentLabel?: string | null): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const rootCrumb: Breadcrumb = { label: rootLabel, to: '/library' };

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'library')) {
    return [rootCrumb];
  }

  let currentPath = '';
  const pageCrumbs = segments.map((segment, index, array) => {
    currentPath += `/${segment}`;
    const isLast = index === array.length - 1;
    
    return {
      label: isLast ? currentLabel ?? normalizeLabel(segment) : normalizeLabel(segment),
      to: currentPath,
    };
  });

  // If the first segment is already 'library', we don't want to double it with rootCrumb
  if (segments[0] === 'library') {
    return pageCrumbs;
  }

  return [rootCrumb, ...pageCrumbs];
}

export function getInitials(value: string) {
  const source = value.includes('@') ? value.split('@')[0] : value;
  const parts = source.split(/[^a-z0-9]+/i).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'RA';
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}
