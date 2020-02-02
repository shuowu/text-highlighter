export default function unbindEvents(el, scope) {
  el.removeEventListener('mouseup', scope.highlightHandler.bind(scope));
  el.removeEventListener('touchend', scope.highlightHandler.bind(scope));
}
