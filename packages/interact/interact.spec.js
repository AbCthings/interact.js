import { JSDOM } from '@interactjs/_dev/test/domator';
import test from '@interactjs/_dev/test/test';
import interactions from '@interactjs/core/interactions';
import interact, { scope } from './interact';
test('interact export', (t) => {
    scope.init(new JSDOM('').window);
    interactions.install(scope);
    const interactable1 = interact('selector');
    t.assert(interactable1 instanceof scope.Interactable, 'interact function returns Interactable instance');
    t.equal(interact('selector'), interactable1, 'same interactable is returned with same target and context');
    t.equal(scope.interactables.list.length, 1, 'new interactables are added to list');
    interactable1.unset();
    t.equal(scope.interactables.list.length, 0, 'unset interactables are removed');
    const constructsUniqueMessage = 'unique contexts make unique interactables with identical targets';
    const doc1 = new JSDOM('').window.document;
    const doc2 = new JSDOM('').window.document;
    const results = [
        ['repeat', doc1],
        ['repeat', doc2],
        [doc1, doc1],
        [doc2.body, doc2],
    ].reduce((acc, [target, context]) => {
        const interactable = interact(target, { context });
        if (acc.includes(interactable)) {
            t.fail(constructsUniqueMessage);
        }
        acc.push({ interactable, target, context });
        return acc;
    }, []);
    t.pass(constructsUniqueMessage);
    const getsUniqueMessage = 'interactions.get returns correct result with identical targets and different contexts';
    for (const { interactable, target, context } of results) {
        if (scope.interactables.get(target, { context }) !== interactable) {
            t.fail(getsUniqueMessage);
        }
    }
    t.pass(getsUniqueMessage);
    const doc3 = new JSDOM('').window.document;
    const prevDocCount = scope.documents.length;
    interact.addDocument(doc3, { events: { passive: false } });
    t.deepEqual(scope.documents[prevDocCount], { doc: doc3, options: { events: { passive: false } } }, 'interact.addDocument() adds to scope with options');
    interact.removeDocument(doc3);
    t.equal(scope.documents.length, prevDocCount, 'interact.removeDocument() removes document from scope');
    scope.interactables.list.forEach((i) => i.unset());
    t.end();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Quc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVyYWN0LnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLCtCQUErQixDQUFBO0FBQ3JELE9BQU8sSUFBSSxNQUFNLDRCQUE0QixDQUFBO0FBQzdDLE9BQU8sWUFBWSxNQUFNLCtCQUErQixDQUFBO0FBQ3hELE9BQU8sUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRTVDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO0lBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDaEMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUUzQixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDMUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLFlBQVksS0FBSyxDQUFDLFlBQVksRUFDbEQsaURBQWlELENBQUMsQ0FBQTtJQUNwRCxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxhQUFhLEVBQ3pDLDREQUE0RCxDQUFDLENBQUE7SUFDL0QsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUN4QyxxQ0FBcUMsQ0FBQyxDQUFBO0lBRXhDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNyQixDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQ3hDLGlDQUFpQyxDQUFDLENBQUE7SUFFcEMsTUFBTSx1QkFBdUIsR0FDM0Isa0VBQWtFLENBQUE7SUFFcEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTtJQUMxQyxNQUFNLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFBO0lBQzFDLE1BQU0sT0FBTyxHQUFHO1FBQ2QsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDO1FBQ2hCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztRQUNoQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7UUFDWixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0tBQ2xCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUU7UUFDbEMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFFbEQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzlCLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtTQUNoQztRQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDM0MsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUE7SUFFL0IsTUFBTSxpQkFBaUIsR0FDckIsdUZBQXVGLENBQUE7SUFFekYsS0FBSyxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxPQUFPLEVBQUU7UUFDdkQsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxLQUFLLFlBQVksRUFBRTtZQUNqRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7U0FDMUI7S0FDRjtJQUVELENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtJQUV6QixNQUFNLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFBO0lBRTFDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFBO0lBRTNDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMxRCxDQUFDLENBQUMsU0FBUyxDQUNULEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEVBQzdCLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUN0RCxtREFBbUQsQ0FBQyxDQUFBO0lBRXRELFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0IsQ0FBQyxDQUFDLEtBQUssQ0FDTCxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFDdEIsWUFBWSxFQUNaLHVEQUF1RCxDQUFDLENBQUE7SUFFMUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUVsRCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDVCxDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEpTRE9NIH0gZnJvbSAnQGludGVyYWN0anMvX2Rldi90ZXN0L2RvbWF0b3InXG5pbXBvcnQgdGVzdCBmcm9tICdAaW50ZXJhY3Rqcy9fZGV2L3Rlc3QvdGVzdCdcbmltcG9ydCBpbnRlcmFjdGlvbnMgZnJvbSAnQGludGVyYWN0anMvY29yZS9pbnRlcmFjdGlvbnMnXG5pbXBvcnQgaW50ZXJhY3QsIHsgc2NvcGUgfSBmcm9tICcuL2ludGVyYWN0J1xuXG50ZXN0KCdpbnRlcmFjdCBleHBvcnQnLCAodCkgPT4ge1xuICBzY29wZS5pbml0KG5ldyBKU0RPTSgnJykud2luZG93KVxuICBpbnRlcmFjdGlvbnMuaW5zdGFsbChzY29wZSlcblxuICBjb25zdCBpbnRlcmFjdGFibGUxID0gaW50ZXJhY3QoJ3NlbGVjdG9yJylcbiAgdC5hc3NlcnQoaW50ZXJhY3RhYmxlMSBpbnN0YW5jZW9mIHNjb3BlLkludGVyYWN0YWJsZSxcbiAgICAnaW50ZXJhY3QgZnVuY3Rpb24gcmV0dXJucyBJbnRlcmFjdGFibGUgaW5zdGFuY2UnKVxuICB0LmVxdWFsKGludGVyYWN0KCdzZWxlY3RvcicpLCBpbnRlcmFjdGFibGUxLFxuICAgICdzYW1lIGludGVyYWN0YWJsZSBpcyByZXR1cm5lZCB3aXRoIHNhbWUgdGFyZ2V0IGFuZCBjb250ZXh0JylcbiAgdC5lcXVhbChzY29wZS5pbnRlcmFjdGFibGVzLmxpc3QubGVuZ3RoLCAxLFxuICAgICduZXcgaW50ZXJhY3RhYmxlcyBhcmUgYWRkZWQgdG8gbGlzdCcpXG5cbiAgaW50ZXJhY3RhYmxlMS51bnNldCgpXG4gIHQuZXF1YWwoc2NvcGUuaW50ZXJhY3RhYmxlcy5saXN0Lmxlbmd0aCwgMCxcbiAgICAndW5zZXQgaW50ZXJhY3RhYmxlcyBhcmUgcmVtb3ZlZCcpXG5cbiAgY29uc3QgY29uc3RydWN0c1VuaXF1ZU1lc3NhZ2UgPVxuICAgICd1bmlxdWUgY29udGV4dHMgbWFrZSB1bmlxdWUgaW50ZXJhY3RhYmxlcyB3aXRoIGlkZW50aWNhbCB0YXJnZXRzJ1xuXG4gIGNvbnN0IGRvYzEgPSBuZXcgSlNET00oJycpLndpbmRvdy5kb2N1bWVudFxuICBjb25zdCBkb2MyID0gbmV3IEpTRE9NKCcnKS53aW5kb3cuZG9jdW1lbnRcbiAgY29uc3QgcmVzdWx0cyA9IFtcbiAgICBbJ3JlcGVhdCcsIGRvYzFdLFxuICAgIFsncmVwZWF0JywgZG9jMl0sXG4gICAgW2RvYzEsIGRvYzFdLFxuICAgIFtkb2MyLmJvZHksIGRvYzJdLFxuICBdLnJlZHVjZSgoYWNjLCBbdGFyZ2V0LCBjb250ZXh0XSkgPT4ge1xuICAgIGNvbnN0IGludGVyYWN0YWJsZSA9IGludGVyYWN0KHRhcmdldCwgeyBjb250ZXh0IH0pXG5cbiAgICBpZiAoYWNjLmluY2x1ZGVzKGludGVyYWN0YWJsZSkpIHtcbiAgICAgIHQuZmFpbChjb25zdHJ1Y3RzVW5pcXVlTWVzc2FnZSlcbiAgICB9XG5cbiAgICBhY2MucHVzaCh7IGludGVyYWN0YWJsZSwgdGFyZ2V0LCBjb250ZXh0IH0pXG4gICAgcmV0dXJuIGFjY1xuICB9LCBbXSlcblxuICB0LnBhc3MoY29uc3RydWN0c1VuaXF1ZU1lc3NhZ2UpXG5cbiAgY29uc3QgZ2V0c1VuaXF1ZU1lc3NhZ2UgPVxuICAgICdpbnRlcmFjdGlvbnMuZ2V0IHJldHVybnMgY29ycmVjdCByZXN1bHQgd2l0aCBpZGVudGljYWwgdGFyZ2V0cyBhbmQgZGlmZmVyZW50IGNvbnRleHRzJ1xuXG4gIGZvciAoY29uc3QgeyBpbnRlcmFjdGFibGUsIHRhcmdldCwgY29udGV4dCB9IG9mIHJlc3VsdHMpIHtcbiAgICBpZiAoc2NvcGUuaW50ZXJhY3RhYmxlcy5nZXQodGFyZ2V0LCB7IGNvbnRleHQgfSkgIT09IGludGVyYWN0YWJsZSkge1xuICAgICAgdC5mYWlsKGdldHNVbmlxdWVNZXNzYWdlKVxuICAgIH1cbiAgfVxuXG4gIHQucGFzcyhnZXRzVW5pcXVlTWVzc2FnZSlcblxuICBjb25zdCBkb2MzID0gbmV3IEpTRE9NKCcnKS53aW5kb3cuZG9jdW1lbnRcblxuICBjb25zdCBwcmV2RG9jQ291bnQgPSBzY29wZS5kb2N1bWVudHMubGVuZ3RoXG5cbiAgaW50ZXJhY3QuYWRkRG9jdW1lbnQoZG9jMywgeyBldmVudHM6IHsgcGFzc2l2ZTogZmFsc2UgfSB9KVxuICB0LmRlZXBFcXVhbChcbiAgICBzY29wZS5kb2N1bWVudHNbcHJldkRvY0NvdW50XSxcbiAgICB7IGRvYzogZG9jMywgb3B0aW9uczogeyBldmVudHM6IHsgcGFzc2l2ZTogZmFsc2UgfSB9IH0sXG4gICAgJ2ludGVyYWN0LmFkZERvY3VtZW50KCkgYWRkcyB0byBzY29wZSB3aXRoIG9wdGlvbnMnKVxuXG4gIGludGVyYWN0LnJlbW92ZURvY3VtZW50KGRvYzMpXG4gIHQuZXF1YWwoXG4gICAgc2NvcGUuZG9jdW1lbnRzLmxlbmd0aCxcbiAgICBwcmV2RG9jQ291bnQsXG4gICAgJ2ludGVyYWN0LnJlbW92ZURvY3VtZW50KCkgcmVtb3ZlcyBkb2N1bWVudCBmcm9tIHNjb3BlJylcblxuICBzY29wZS5pbnRlcmFjdGFibGVzLmxpc3QuZm9yRWFjaCgoaSkgPT4gaS51bnNldCgpKVxuXG4gIHQuZW5kKClcbn0pXG4iXX0=