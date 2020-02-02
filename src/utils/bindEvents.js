export default function bindEvents(el, scope) {
  el.addEventListener('mouseup', scope.highlightHandler.bind(scope));
  el.addEventListener('touchend', scope.highlightHandler.bind(scope));
}
