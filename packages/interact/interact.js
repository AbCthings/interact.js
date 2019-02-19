/** @module interact */
import { Scope } from '@interactjs/core/scope';
import * as utils from '@interactjs/utils';
import browser from '@interactjs/utils/browser';
import events from '@interactjs/utils/events';
const globalEvents = {};
const scope = new Scope();
/**
 * ```js
 * interact('#draggable').draggable(true)
 *
 * var rectables = interact('rect')
 * rectables
 *   .gesturable(true)
 *   .on('gesturemove', function (event) {
 *       // ...
 *   })
 * ```
 *
 * The methods of this variable can be used to set elements as interactables
 * and also to change various default settings.
 *
 * Calling it as a function and passing an element or a valid CSS selector
 * string returns an Interactable object which has various methods to configure
 * it.
 *
 * @global
 *
 * @param {Element | string} target The HTML or SVG Element to interact with
 * or CSS selector
 * @return {Interactable}
 */
export const interact = function interact(target, options) {
    let interactable = scope.interactables.get(target, options);
    if (!interactable) {
        interactable = scope.interactables.new(target, options);
        interactable.events.global = globalEvents;
    }
    return interactable;
};
scope._plugins = [];
/**
 * Use a plugin
 *
 * @alias module:interact.use
 *
 * @param {Object} plugin
 * @param {function} plugin.install
 * @return {interact}
 */
interact.use = use;
function use(plugin) {
    if (scope._plugins.indexOf(plugin) !== -1) {
        return interact;
    }
    plugin.install(scope);
    scope._plugins.push(plugin);
    return interact;
}
/**
 * Check if an element or selector has been set with the {@link interact}
 * function
 *
 * @alias module:interact.isSet
 *
 * @param {Element} element The Element being searched for
 * @return {boolean} Indicates if the element or CSS selector was previously
 * passed to interact
 */
interact.isSet = isSet;
function isSet(element, options) {
    return scope.interactables.indexOfElement(element, options && options.context) !== -1;
}
/**
 * Add a global listener for an InteractEvent or adds a DOM event to `document`
 *
 * @alias module:interact.on
 *
 * @param {string | array | object} type The types of events to listen for
 * @param {function} listener The function event (s)
 * @param {object | boolean} [options] object or useCapture flag for
 * addEventListener
 * @return {object} interact
 */
interact.on = on;
function on(type, listener, options) {
    if (utils.is.string(type) && type.search(' ') !== -1) {
        type = type.trim().split(/ +/);
    }
    if (utils.is.array(type)) {
        for (const eventType of type) {
            interact.on(eventType, listener, options);
        }
        return interact;
    }
    if (utils.is.object(type)) {
        for (const prop in type) {
            interact.on(prop, type[prop], listener);
        }
        return interact;
    }
    // if it is an InteractEvent type, add listener to globalEvents
    if (utils.arr.contains(scope.actions.eventTypes, type)) {
        // if this type of event was never bound
        if (!globalEvents[type]) {
            globalEvents[type] = [listener];
        }
        else {
            globalEvents[type].push(listener);
        }
    }
    // If non InteractEvent type, addEventListener to document
    else {
        events.add(scope.document, type, listener, { options });
    }
    return interact;
}
/**
 * Removes a global InteractEvent listener or DOM event from `document`
 *
 * @alias module:interact.off
 *
 * @param {string | array | object} type The types of events that were listened
 * for
 * @param {function} listener The listener function to be removed
 * @param {object | boolean} options [options] object or useCapture flag for
 * removeEventListener
 * @return {object} interact
 */
interact.off = off;
function off(type, listener, options) {
    if (utils.is.string(type) && type.search(' ') !== -1) {
        type = type.trim().split(/ +/);
    }
    if (utils.is.array(type)) {
        for (const eventType of type) {
            interact.off(eventType, listener, options);
        }
        return interact;
    }
    if (utils.is.object(type)) {
        for (const prop in type) {
            interact.off(prop, type[prop], listener);
        }
        return interact;
    }
    if (!utils.arr.contains(scope.actions.eventTypes, type)) {
        events.remove(scope.document, type, listener, options);
    }
    else {
        let index;
        if (type in globalEvents &&
            (index = globalEvents[type].indexOf(listener)) !== -1) {
            globalEvents[type].splice(index, 1);
        }
    }
    return interact;
}
/**
 * Returns an object which exposes internal data
 * @alias module:interact.debug
 *
 * @return {object} An object with properties that outline the current state
 * and expose internal functions and variables
 */
interact.debug = debug;
function debug() {
    return scope;
}
// expose the functions used to calculate multi-touch properties
interact.getPointerAverage = utils.pointer.pointerAverage;
interact.getTouchBBox = utils.pointer.touchBBox;
interact.getTouchDistance = utils.pointer.touchDistance;
interact.getTouchAngle = utils.pointer.touchAngle;
interact.getElementRect = utils.dom.getElementRect;
interact.getElementClientRect = utils.dom.getElementClientRect;
interact.matchesSelector = utils.dom.matchesSelector;
interact.closest = utils.dom.closest;
/**
 * @alias module:interact.supportsTouch
 *
 * @return {boolean} Whether or not the browser supports touch input
 */
interact.supportsTouch = supportsTouch;
function supportsTouch() {
    return browser.supportsTouch;
}
/**
 * @alias module:interact.supportsPointerEvent
 *
 * @return {boolean} Whether or not the browser supports PointerEvents
 */
interact.supportsPointerEvent = supportsPointerEvent;
function supportsPointerEvent() {
    return browser.supportsPointerEvent;
}
/**
 * Cancels all interactions (end events are not fired)
 *
 * @alias module:interact.stop
 *
 * @return {object} interact
 */
interact.stop = stop;
function stop() {
    for (const interaction of scope.interactions.list) {
        interaction.stop();
    }
    return interact;
}
/**
 * Returns or sets the distance the pointer must be moved before an action
 * sequence occurs. This also affects tolerance for tap events.
 *
 * @alias module:interact.pointerMoveTolerance
 *
 * @param {number} [newValue] The movement from the start position must be greater than this value
 * @return {interact | number}
 */
interact.pointerMoveTolerance = pointerMoveTolerance;
function pointerMoveTolerance(newValue) {
    if (utils.is.number(newValue)) {
        scope.interactions.pointerMoveTolerance = newValue;
        return interact;
    }
    return scope.interactions.pointerMoveTolerance;
}
scope.interactables.signals.on('unset', ({ interactable }) => {
    scope.interactables.list.splice(scope.interactables.list.indexOf(interactable), 1);
    // Stop related interactions when an Interactable is unset
    for (const interaction of scope.interactions.list) {
        if (interaction.interactable === interactable && interaction.interacting() && interaction._ending) {
            interaction.stop();
        }
    }
});
interact.addDocument = (doc, options) => scope.addDocument(doc, options);
interact.removeDocument = (doc) => scope.removeDocument(doc);
scope.interact = interact;
export { scope };
export default interact;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlcmFjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx1QkFBdUI7QUFJdkIsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sS0FBSyxLQUFLLE1BQU0sbUJBQW1CLENBQUE7QUFDMUMsT0FBTyxPQUFPLE1BQU0sMkJBQTJCLENBQUE7QUFDL0MsT0FBTyxNQUFNLE1BQU0sMEJBQTBCLENBQUE7QUFzQzdDLE1BQU0sWUFBWSxHQUFRLEVBQUUsQ0FBQTtBQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFBO0FBRXpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQW1CLFNBQVMsUUFBUSxDQUFFLE1BQXVCLEVBQUUsT0FBYTtJQUMvRixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFM0QsSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNqQixZQUFZLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQ3ZELFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQTtLQUMxQztJQUVELE9BQU8sWUFBWSxDQUFBO0FBQ3JCLENBQW1CLENBQUE7QUFFbkIsS0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFFbkI7Ozs7Ozs7O0dBUUc7QUFDSCxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUNsQixTQUFTLEdBQUcsQ0FBRSxNQUFjO0lBQzFCLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDekMsT0FBTyxRQUFRLENBQUE7S0FD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eyBPcHRpb25zIH0gZnJvbSAnQGludGVyYWN0anMvY29yZS9kZWZhdWx0T3B0aW9ucydcbmltcG9ydCBJbnRlcmFjdGFibGUgZnJvbSAnQGludGVyYWN0anMvY29yZS9JbnRlcmFjdGFibGUnXG5pbXBvcnQgeyBTY29wZSB9IGZyb20gJ0BpbnRlcmFjdGpzL2NvcmUvc2NvcGUnXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAaW50ZXJhY3Rqcy91dGlscydcbmltcG9ydCBicm93c2VyIGZyb20gJ0BpbnRlcmFjdGpzL3V0aWxzL2Jyb3dzZXInXG5pbXBvcnQgZXZlbnRzIGZyb20gJ0BpbnRlcmFjdGpzL3V0aWxzL2V2ZW50cydcblxuZXhwb3J0IGludGVyZmFjZSBQbHVnaW4ge1xuICBpbnN0YWxsIChzY29wZTogU2NvcGUpOiB2b2lkXG4gIFtrZXk6IHN0cmluZ106IGFueVxufVxuXG5kZWNsYXJlIG1vZHVsZSAnQGludGVyYWN0anMvY29yZS9zY29wZScge1xuICBpbnRlcmZhY2UgU2NvcGUge1xuICAgIGludGVyYWN0OiBJbnRlcmFjdFN0YXRpY1xuICAgIF9wbHVnaW5zOiBQbHVnaW5bXVxuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJhY3RTdGF0aWMge1xuICAodGFyZ2V0OiBJbnRlcmFjdC5UYXJnZXQsIG9wdGlvbnM/OiBPcHRpb25zKTogSW50ZXJhY3RhYmxlXG4gIG9uOiB0eXBlb2Ygb25cbiAgcG9pbnRlck1vdmVUb2xlcmFuY2U6IHR5cGVvZiBwb2ludGVyTW92ZVRvbGVyYW5jZVxuICBzdG9wOiB0eXBlb2Ygc3RvcFxuICBzdXBwb3J0c1BvaW50ZXJFdmVudDogdHlwZW9mIHN1cHBvcnRzUG9pbnRlckV2ZW50XG4gIHN1cHBvcnRzVG91Y2g6IHR5cGVvZiBzdXBwb3J0c1RvdWNoXG4gIGRlYnVnOiB0eXBlb2YgZGVidWdcbiAgb2ZmOiB0eXBlb2Ygb2ZmXG4gIGlzU2V0OiB0eXBlb2YgaXNTZXRcbiAgdXNlOiB0eXBlb2YgdXNlXG4gIGdldFBvaW50ZXJBdmVyYWdlOiB0eXBlb2YgdXRpbHMucG9pbnRlci5wb2ludGVyQXZlcmFnZVxuICBnZXRUb3VjaEJCb3g6IHR5cGVvZiB1dGlscy5wb2ludGVyLnRvdWNoQkJveFxuICBnZXRUb3VjaERpc3RhbmNlOiB0eXBlb2YgdXRpbHMucG9pbnRlci50b3VjaERpc3RhbmNlXG4gIGdldFRvdWNoQW5nbGU6IHR5cGVvZiB1dGlscy5wb2ludGVyLnRvdWNoQW5nbGVcbiAgZ2V0RWxlbWVudFJlY3Q6IHR5cGVvZiB1dGlscy5kb20uZ2V0RWxlbWVudFJlY3RcbiAgZ2V0RWxlbWVudENsaWVudFJlY3Q6IHR5cGVvZiB1dGlscy5kb20uZ2V0RWxlbWVudENsaWVudFJlY3RcbiAgbWF0Y2hlc1NlbGVjdG9yOiB0eXBlb2YgdXRpbHMuZG9tLm1hdGNoZXNTZWxlY3RvclxuICBjbG9zZXN0OiB0eXBlb2YgdXRpbHMuZG9tLmNsb3Nlc3RcbiAgYWRkRG9jdW1lbnQ6IHR5cGVvZiBzY29wZS5hZGREb2N1bWVudFxuICByZW1vdmVEb2N1bWVudDogdHlwZW9mIHNjb3BlLnJlbW92ZURvY3VtZW50XG4gIHZlcnNpb246IHN0cmluZ1xufVxuXG5jb25zdCBnbG9iYWxFdmVudHM6IGFueSA9IHt9XG5jb25zdCBzY29wZSA9IG5ldyBTY29wZSgpXG5cbi8qKlxuICogYGBganNcbiAqIGludGVyYWN0KCcjZHJhZ2dhYmxlJykuZHJhZ2dhYmxlKHRydWUpXG4gKlxuICogdmFyIHJlY3RhYmxlcyA9IGludGVyYWN0KCdyZWN0JylcbiAqIHJlY3RhYmxlc1xuICogICAuZ2VzdHVyYWJsZSh0cnVlKVxuICogICAub24oJ2dlc3R1cmVtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gKiAgICAgICAvLyAuLi5cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqIFRoZSBtZXRob2RzIG9mIHRoaXMgdmFyaWFibGUgY2FuIGJlIHVzZWQgdG8gc2V0IGVsZW1lbnRzIGFzIGludGVyYWN0YWJsZXNcbiAqIGFuZCBhbHNvIHRvIGNoYW5nZSB2YXJpb3VzIGRlZmF1bHQgc2V0dGluZ3MuXG4gKlxuICogQ2FsbGluZyBpdCBhcyBhIGZ1bmN0aW9uIGFuZCBwYXNzaW5nIGFuIGVsZW1lbnQgb3IgYSB2YWxpZCBDU1Mgc2VsZWN0b3JcbiAqIHN0cmluZyByZXR1cm5zIGFuIEludGVyYWN0YWJsZSBvYmplY3Qgd2hpY2ggaGFzIHZhcmlvdXMgbWV0aG9kcyB0byBjb25maWd1cmVcbiAqIGl0LlxuICpcbiAqIEBnbG9iYWxcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnQgfCBzdHJpbmd9IHRhcmdldCBUaGUgSFRNTCBvciBTVkcgRWxlbWVudCB0byBpbnRlcmFjdCB3aXRoXG4gKiBvciBDU1Mgc2VsZWN0b3JcbiAqIEByZXR1cm4ge0ludGVyYWN0YWJsZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGludGVyYWN0OiBJbnRlcmFjdFN0YXRpYyA9IGZ1bmN0aW9uIGludGVyYWN0ICh0YXJnZXQ6IEludGVyYWN0LlRhcmdldCwgb3B0aW9ucz86IGFueSkge1xuICBsZXQgaW50ZXJhY3RhYmxlID0gc2NvcGUuaW50ZXJhY3RhYmxlcy5nZXQodGFyZ2V0LCBvcHRpb25zKVxuXG4gIGlmICghaW50ZXJhY3RhYmxlKSB7XG4gICAgaW50ZXJhY3RhYmxlID0gc2NvcGUuaW50ZXJhY3RhYmxlcy5uZXcodGFyZ2V0LCBvcHRpb25zKVxuICAgIGludGVyYWN0YWJsZS5ldmVudHMuZ2xvYmFsID0gZ2xvYmFsRXZlbnRzXG4gIH1cblxuICByZXR1cm4gaW50ZXJhY3RhYmxlXG59IGFzIEludGVyYWN0U3RhdGljXG5cbnNjb3BlLl9wbHVnaW5zID0gW11cblxuLyoqXG4gKiBVc2UgYSBwbHVnaW5cbiAqXG4gKiBAYWxpYXMgbW9kdWxlOmludGVyYWN0LnVzZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHBsdWdpbi5pbnN0YWxsXG4gKiBAcmV0dXJuIHtpbnRlcmFjdH1cbiAqL1xuaW50ZXJhY3QudXNlID0gdXNlXG5mdW5jdGlvbiB1c2UgKHBsdWdpbjogUGx1Z2luKSB7XG4gIGlmIChzY29wZS5fcGx1Z2lucy5pbmRleE9mKHBsdWdpbikgIT09IC0xKSB7XG4gICAgcmV0dXJuIGludGVyYWN0XG4gIH1cblxuICBwbHVnaW4uaW5zdGFsbChzY29wZSlcbiAgc2NvcGUuX3BsdWdpbnMucHVzaChwbHVnaW4pXG4gIHJldHVybiBpbnRlcmFjdFxufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGVsZW1lbnQgb3Igc2VsZWN0b3IgaGFzIGJlZW4gc2V0IHdpdGggdGhlIHtAbGluayBpbnRlcmFjdH1cbiAqIGZ1bmN0aW9uXG4gKlxuICogQGFsaWFzIG1vZHVsZTppbnRlcmFjdC5pc1NldFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBUaGUgRWxlbWVudCBiZWluZyBzZWFyY2hlZCBmb3JcbiAqIEByZXR1cm4ge2Jvb2xlYW59IEluZGljYXRlcyBpZiB0aGUgZWxlbWVudCBvciBDU1Mgc2VsZWN0b3Igd2FzIHByZXZpb3VzbHlcbiAqIHBhc3NlZCB0byBpbnRlcmFjdFxuICovXG5pbnRlcmFjdC5pc1NldCA9IGlzU2V0XG5mdW5jdGlvbiBpc1NldCAoZWxlbWVudDogRWxlbWVudCwgb3B0aW9ucz86IGFueSkge1xuICByZXR1cm4gc2NvcGUuaW50ZXJhY3RhYmxlcy5pbmRleE9mRWxlbWVudChlbGVtZW50LCBvcHRpb25zICYmIG9wdGlvbnMuY29udGV4dCkgIT09IC0xXG59XG5cbi8qKlxuICogQWRkIGEgZ2xvYmFsIGxpc3RlbmVyIGZvciBhbiBJbnRlcmFjdEV2ZW50IG9yIGFkZHMgYSBET00gZXZlbnQgdG8gYGRvY3VtZW50YFxuICpcbiAqIEBhbGlhcyBtb2R1bGU6aW50ZXJhY3Qub25cbiAqXG4gKiBAcGFyYW0ge3N0cmluZyB8IGFycmF5IHwgb2JqZWN0fSB0eXBlIFRoZSB0eXBlcyBvZiBldmVudHMgdG8gbGlzdGVuIGZvclxuICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGZ1bmN0aW9uIGV2ZW50IChzKVxuICogQHBhcmFtIHtvYmplY3QgfCBib29sZWFufSBbb3B0aW9uc10gb2JqZWN0IG9yIHVzZUNhcHR1cmUgZmxhZyBmb3JcbiAqIGFkZEV2ZW50TGlzdGVuZXJcbiAqIEByZXR1cm4ge29iamVjdH0gaW50ZXJhY3RcbiAqL1xuaW50ZXJhY3Qub24gPSBvblxuZnVuY3Rpb24gb24gKHR5cGU6IHN0cmluZyB8IEludGVyYWN0LkV2ZW50VHlwZXMsIGxpc3RlbmVyOiBJbnRlcmFjdC5MaXN0ZW5lcnNBcmcsIG9wdGlvbnM/KSB7XG4gIGlmICh1dGlscy5pcy5zdHJpbmcodHlwZSkgJiYgdHlwZS5zZWFyY2goJyAnKSAhPT0gLTEpIHtcbiAgICB0eXBlID0gdHlwZS50cmltKCkuc3BsaXQoLyArLylcbiAgfVxuXG4gIGlmICh1dGlscy5pcy5hcnJheSh0eXBlKSkge1xuICAgIGZvciAoY29uc3QgZXZlbnRUeXBlIG9mICh0eXBlIGFzIGFueVtdKSkge1xuICAgICAgaW50ZXJhY3Qub24oZXZlbnRUeXBlLCBsaXN0ZW5lciwgb3B0aW9ucylcbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJhY3RcbiAgfVxuXG4gIGlmICh1dGlscy5pcy5vYmplY3QodHlwZSkpIHtcbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gdHlwZSkge1xuICAgICAgaW50ZXJhY3Qub24ocHJvcCwgKHR5cGUgYXMgSW50ZXJhY3QuRXZlbnRUeXBlcylbcHJvcF0sIGxpc3RlbmVyKVxuICAgIH1cblxuICAgIHJldHVybiBpbnRlcmFjdFxuICB9XG5cbiAgLy8gaWYgaXQgaXMgYW4gSW50ZXJhY3RFdmVudCB0eXBlLCBhZGQgbGlzdGVuZXIgdG8gZ2xvYmFsRXZlbnRzXG4gIGlmICh1dGlscy5hcnIuY29udGFpbnMoc2NvcGUuYWN0aW9ucy5ldmVudFR5cGVzLCB0eXBlKSkge1xuICAgIC8vIGlmIHRoaXMgdHlwZSBvZiBldmVudCB3YXMgbmV2ZXIgYm91bmRcbiAgICBpZiAoIWdsb2JhbEV2ZW50c1t0eXBlXSkge1xuICAgICAgZ2xvYmFsRXZlbnRzW3R5cGVdID0gW2xpc3RlbmVyXVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGdsb2JhbEV2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKVxuICAgIH1cbiAgfVxuICAvLyBJZiBub24gSW50ZXJhY3RFdmVudCB0eXBlLCBhZGRFdmVudExpc3RlbmVyIHRvIGRvY3VtZW50XG4gIGVsc2Uge1xuICAgIGV2ZW50cy5hZGQoc2NvcGUuZG9jdW1lbnQsIHR5cGUsIGxpc3RlbmVyIGFzIEludGVyYWN0Lkxpc3RlbmVyLCB7IG9wdGlvbnMgfSlcbiAgfVxuXG4gIHJldHVybiBpbnRlcmFjdFxufVxuXG4vKipcbiAqIFJlbW92ZXMgYSBnbG9iYWwgSW50ZXJhY3RFdmVudCBsaXN0ZW5lciBvciBET00gZXZlbnQgZnJvbSBgZG9jdW1lbnRgXG4gKlxuICogQGFsaWFzIG1vZHVsZTppbnRlcmFjdC5vZmZcbiAqXG4gKiBAcGFyYW0ge3N0cmluZyB8IGFycmF5IHwgb2JqZWN0fSB0eXBlIFRoZSB0eXBlcyBvZiBldmVudHMgdGhhdCB3ZXJlIGxpc3RlbmVkXG4gKiBmb3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBmdW5jdGlvbiB0byBiZSByZW1vdmVkXG4gKiBAcGFyYW0ge29iamVjdCB8IGJvb2xlYW59IG9wdGlvbnMgW29wdGlvbnNdIG9iamVjdCBvciB1c2VDYXB0dXJlIGZsYWcgZm9yXG4gKiByZW1vdmVFdmVudExpc3RlbmVyXG4gKiBAcmV0dXJuIHtvYmplY3R9IGludGVyYWN0XG4gKi9cbmludGVyYWN0Lm9mZiA9IG9mZlxuZnVuY3Rpb24gb2ZmICh0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucykge1xuICBpZiAodXRpbHMuaXMuc3RyaW5nKHR5cGUpICYmIHR5cGUuc2VhcmNoKCcgJykgIT09IC0xKSB7XG4gICAgdHlwZSA9IHR5cGUudHJpbSgpLnNwbGl0KC8gKy8pXG4gIH1cblxuICBpZiAodXRpbHMuaXMuYXJyYXkodHlwZSkpIHtcbiAgICBmb3IgKGNvbnN0IGV2ZW50VHlwZSBvZiB0eXBlKSB7XG4gICAgICBpbnRlcmFjdC5vZmYoZXZlbnRUeXBlLCBsaXN0ZW5lciwgb3B0aW9ucylcbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJhY3RcbiAgfVxuXG4gIGlmICh1dGlscy5pcy5vYmplY3QodHlwZSkpIHtcbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gdHlwZSkge1xuICAgICAgaW50ZXJhY3Qub2ZmKHByb3AsIHR5cGVbcHJvcF0sIGxpc3RlbmVyKVxuICAgIH1cblxuICAgIHJldHVybiBpbnRlcmFjdFxuICB9XG5cbiAgaWYgKCF1dGlscy5hcnIuY29udGFpbnMoc2NvcGUuYWN0aW9ucy5ldmVudFR5cGVzLCB0eXBlKSkge1xuICAgIGV2ZW50cy5yZW1vdmUoc2NvcGUuZG9jdW1lbnQsIHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKVxuICB9XG4gIGVsc2Uge1xuICAgIGxldCBpbmRleFxuXG4gICAgaWYgKHR5cGUgaW4gZ2xvYmFsRXZlbnRzICYmXG4gICAgICAgIChpbmRleCA9IGdsb2JhbEV2ZW50c1t0eXBlXS5pbmRleE9mKGxpc3RlbmVyKSkgIT09IC0xKSB7XG4gICAgICBnbG9iYWxFdmVudHNbdHlwZV0uc3BsaWNlKGluZGV4LCAxKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbnRlcmFjdFxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHdoaWNoIGV4cG9zZXMgaW50ZXJuYWwgZGF0YVxuICogQGFsaWFzIG1vZHVsZTppbnRlcmFjdC5kZWJ1Z1xuICpcbiAqIEByZXR1cm4ge29iamVjdH0gQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IG91dGxpbmUgdGhlIGN1cnJlbnQgc3RhdGVcbiAqIGFuZCBleHBvc2UgaW50ZXJuYWwgZnVuY3Rpb25zIGFuZCB2YXJpYWJsZXNcbiAqL1xuaW50ZXJhY3QuZGVidWcgPSBkZWJ1Z1xuZnVuY3Rpb24gZGVidWcgKCkge1xuICByZXR1cm4gc2NvcGVcbn1cblxuLy8gZXhwb3NlIHRoZSBmdW5jdGlvbnMgdXNlZCB0byBjYWxjdWxhdGUgbXVsdGktdG91Y2ggcHJvcGVydGllc1xuaW50ZXJhY3QuZ2V0UG9pbnRlckF2ZXJhZ2UgID0gdXRpbHMucG9pbnRlci5wb2ludGVyQXZlcmFnZVxuaW50ZXJhY3QuZ2V0VG91Y2hCQm94ICAgICAgID0gdXRpbHMucG9pbnRlci50b3VjaEJCb3hcbmludGVyYWN0LmdldFRvdWNoRGlzdGFuY2UgICA9IHV0aWxzLnBvaW50ZXIudG91Y2hEaXN0YW5jZVxuaW50ZXJhY3QuZ2V0VG91Y2hBbmdsZSAgICAgID0gdXRpbHMucG9pbnRlci50b3VjaEFuZ2xlXG5cbmludGVyYWN0LmdldEVsZW1lbnRSZWN0ICAgICAgID0gdXRpbHMuZG9tLmdldEVsZW1lbnRSZWN0XG5pbnRlcmFjdC5nZXRFbGVtZW50Q2xpZW50UmVjdCA9IHV0aWxzLmRvbS5nZXRFbGVtZW50Q2xpZW50UmVjdFxuaW50ZXJhY3QubWF0Y2hlc1NlbGVjdG9yICAgICAgPSB1dGlscy5kb20ubWF0Y2hlc1NlbGVjdG9yXG5pbnRlcmFjdC5jbG9zZXN0ICAgICAgICAgICAgICA9IHV0aWxzLmRvbS5jbG9zZXN0XG5cbi8qKlxuICogQGFsaWFzIG1vZHVsZTppbnRlcmFjdC5zdXBwb3J0c1RvdWNoXG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdG91Y2ggaW5wdXRcbiAqL1xuaW50ZXJhY3Quc3VwcG9ydHNUb3VjaCA9IHN1cHBvcnRzVG91Y2hcbmZ1bmN0aW9uIHN1cHBvcnRzVG91Y2ggKCkge1xuICByZXR1cm4gYnJvd3Nlci5zdXBwb3J0c1RvdWNoXG59XG5cbi8qKlxuICogQGFsaWFzIG1vZHVsZTppbnRlcmFjdC5zdXBwb3J0c1BvaW50ZXJFdmVudFxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBicm93c2VyIHN1cHBvcnRzIFBvaW50ZXJFdmVudHNcbiAqL1xuaW50ZXJhY3Quc3VwcG9ydHNQb2ludGVyRXZlbnQgPSBzdXBwb3J0c1BvaW50ZXJFdmVudFxuZnVuY3Rpb24gc3VwcG9ydHNQb2ludGVyRXZlbnQgKCkge1xuICByZXR1cm4gYnJvd3Nlci5zdXBwb3J0c1BvaW50ZXJFdmVudFxufVxuXG4vKipcbiAqIENhbmNlbHMgYWxsIGludGVyYWN0aW9ucyAoZW5kIGV2ZW50cyBhcmUgbm90IGZpcmVkKVxuICpcbiAqIEBhbGlhcyBtb2R1bGU6aW50ZXJhY3Quc3RvcFxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gaW50ZXJhY3RcbiAqL1xuaW50ZXJhY3Quc3RvcCA9IHN0b3BcbmZ1bmN0aW9uIHN0b3AgKCkge1xuICBmb3IgKGNvbnN0IGludGVyYWN0aW9uIG9mIHNjb3BlLmludGVyYWN0aW9ucy5saXN0KSB7XG4gICAgaW50ZXJhY3Rpb24uc3RvcCgpXG4gIH1cblxuICByZXR1cm4gaW50ZXJhY3Rcbn1cblxuLyoqXG4gKiBSZXR1cm5zIG9yIHNldHMgdGhlIGRpc3RhbmNlIHRoZSBwb2ludGVyIG11c3QgYmUgbW92ZWQgYmVmb3JlIGFuIGFjdGlvblxuICogc2VxdWVuY2Ugb2NjdXJzLiBUaGlzIGFsc28gYWZmZWN0cyB0b2xlcmFuY2UgZm9yIHRhcCBldmVudHMuXG4gKlxuICogQGFsaWFzIG1vZHVsZTppbnRlcmFjdC5wb2ludGVyTW92ZVRvbGVyYW5jZVxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbmV3VmFsdWVdIFRoZSBtb3ZlbWVudCBmcm9tIHRoZSBzdGFydCBwb3NpdGlvbiBtdXN0IGJlIGdyZWF0ZXIgdGhhbiB0aGlzIHZhbHVlXG4gKiBAcmV0dXJuIHtpbnRlcmFjdCB8IG51bWJlcn1cbiAqL1xuaW50ZXJhY3QucG9pbnRlck1vdmVUb2xlcmFuY2UgPSBwb2ludGVyTW92ZVRvbGVyYW5jZVxuZnVuY3Rpb24gcG9pbnRlck1vdmVUb2xlcmFuY2UgKG5ld1ZhbHVlKSB7XG4gIGlmICh1dGlscy5pcy5udW1iZXIobmV3VmFsdWUpKSB7XG4gICAgc2NvcGUuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlID0gbmV3VmFsdWVcblxuICAgIHJldHVybiBpbnRlcmFjdFxuICB9XG5cbiAgcmV0dXJuIHNjb3BlLmludGVyYWN0aW9ucy5wb2ludGVyTW92ZVRvbGVyYW5jZVxufVxuXG5zY29wZS5pbnRlcmFjdGFibGVzLnNpZ25hbHMub24oJ3Vuc2V0JywgKHsgaW50ZXJhY3RhYmxlIH0pID0+IHtcbiAgc2NvcGUuaW50ZXJhY3RhYmxlcy5saXN0LnNwbGljZShzY29wZS5pbnRlcmFjdGFibGVzLmxpc3QuaW5kZXhPZihpbnRlcmFjdGFibGUpLCAxKVxuXG4gIC8vIFN0b3AgcmVsYXRlZCBpbnRlcmFjdGlvbnMgd2hlbiBhbiBJbnRlcmFjdGFibGUgaXMgdW5zZXRcbiAgZm9yIChjb25zdCBpbnRlcmFjdGlvbiBvZiBzY29wZS5pbnRlcmFjdGlvbnMubGlzdCkge1xuICAgIGlmIChpbnRlcmFjdGlvbi5pbnRlcmFjdGFibGUgPT09IGludGVyYWN0YWJsZSAmJiBpbnRlcmFjdGlvbi5pbnRlcmFjdGluZygpICYmIGludGVyYWN0aW9uLl9lbmRpbmcpIHtcbiAgICAgIGludGVyYWN0aW9uLnN0b3AoKVxuICAgIH1cbiAgfVxufSlcblxuaW50ZXJhY3QuYWRkRG9jdW1lbnQgPSAoZG9jLCBvcHRpb25zKSA9PiBzY29wZS5hZGREb2N1bWVudChkb2MsIG9wdGlvbnMpXG5pbnRlcmFjdC5yZW1vdmVEb2N1bWVudCA9IChkb2MpID0+IHNjb3BlLnJlbW92ZURvY3VtZW50KGRvYylcblxuc2NvcGUuaW50ZXJhY3QgPSBpbnRlcmFjdFxuXG5leHBvcnQgeyBzY29wZSB9XG5leHBvcnQgZGVmYXVsdCBpbnRlcmFjdFxuIl19