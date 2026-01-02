type HeadingLevel = 1 | 2 | 3;

const headingSelector = 'h1, h2, h3';

const getHeadingLevel = (heading: HTMLElement): HeadingLevel => {
  const levelAttr = heading.getAttribute('data-level');
  if (levelAttr === '1' || levelAttr === '2' || levelAttr === '3') {
    return Number(levelAttr) as HeadingLevel;
  }
  const tagLevel = Number(heading.tagName.replace('H', ''));
  return (tagLevel >= 1 && tagLevel <= 3 ? tagLevel : 1) as HeadingLevel;
};

const clearHidden = (container: HTMLElement) => {
  const hiddenNodes = container.querySelectorAll<HTMLElement>('[data-hidden-by-heading="true"]');
  hiddenNodes.forEach((node) => {
    node.style.removeProperty('display');
    node.removeAttribute('data-hidden-by-heading');
  });
};

const shouldStopAtHeading = (heading: HTMLElement, currentLevel: HeadingLevel) => {
  const nextLevel = getHeadingLevel(heading);
  return nextLevel <= currentLevel;
};

const hideSection = (
  container: HTMLElement,
  heading: HTMLElement,
  currentLevel: HeadingLevel
) => {
  const children = Array.from(container.children) as HTMLElement[];
  const startIndex = children.indexOf(heading);
  if (startIndex === -1) return;

  for (let i = startIndex + 1; i < children.length; i += 1) {
    const element = children[i];
    const tag = element.tagName.toLowerCase();
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      if (shouldStopAtHeading(element, currentLevel)) {
        break;
      }
    }
    element.setAttribute('data-hidden-by-heading', 'true');
    element.style.display = 'none';
  }
};

const ensureToggleButton = (
  heading: HTMLElement,
  onToggle: (heading: HTMLElement) => void
) => {
  const existing = heading.querySelector<HTMLButtonElement>(':scope > button.heading-toggle');
  if (existing) {
    return existing;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'heading-toggle';
  button.addEventListener('mousedown', (event) => event.preventDefault());
  button.addEventListener('click', (event) => {
    event.preventDefault();
    onToggle(heading);
  });
  heading.prepend(button);
  return button;
};

const setToggleState = (heading: HTMLElement, button: HTMLButtonElement | null) => {
  if (!button) return;
  const collapsed = heading.getAttribute('data-collapsed') === 'true';
  button.textContent = collapsed ? '▸' : '▾';
};

export const applyHeadingCollapse = (
  container: HTMLElement,
  options: { addToggleButtons?: boolean } = {}
) => {
  clearHidden(container);

  const headings = Array.from(container.querySelectorAll<HTMLElement>(headingSelector));

  headings.forEach((heading) => {
    const level = getHeadingLevel(heading);
    heading.setAttribute('data-level', String(level));
    heading.setAttribute('data-collapsible', 'true');
    const collapsed = heading.getAttribute('data-collapsed') === 'true';

    let toggleButton: HTMLButtonElement | null = null;
    if (options.addToggleButtons) {
      toggleButton = ensureToggleButton(heading, (target) => {
        const isCollapsed = target.getAttribute('data-collapsed') === 'true';
        target.setAttribute('data-collapsed', isCollapsed ? 'false' : 'true');
        applyHeadingCollapse(container, options);
      });
    }

    setToggleState(heading, toggleButton);

    if (collapsed) {
      hideSection(container, heading, level);
    }
  });
};
