export const scrollIntoView = (element: HTMLElement, options: { offset?: number } = {}) => {
    const { offset = 0 } = options;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = rect.top + scrollTop + offset;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
    });
};