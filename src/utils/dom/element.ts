export const createAppendedElement = (className = 'plugin') => {
  const element = document.createElement('div');
  element.classList.add(className);
  document.body.append(element);
  return element;
};

export const removeElement = (element: Element) => {
  element.remove();
};
