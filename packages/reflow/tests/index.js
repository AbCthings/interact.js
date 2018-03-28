import test from '@interactjs/_dev/test/test';
import * as helpers from '@interactjs/_dev/test/helpers';
import reflow from '@interactjs/reflow';
import win from '@interactjs/utils/window';
import interactions from '@interactjs/core/interactions';

test('reflow', t => {
  const scope = helpers.mockScope();

  interactions.init(scope);

  Object.assign(scope.actions, { test: {}, names: ['test'] });

  reflow.init(scope);

  t.ok(
    scope.Interactable.prototype.reflow instanceof Function,
    'reflow method is added to Interactable.prototype'
  );

  const fired = [];
  const interactable = scope.interactables.new(win.window);
  const rect = Object.freeze({ top: 100, left: 200, bottom: 300, right: 400 });

  interactable.fire = iEvent => fired.push(iEvent);
  interactable.target = {};
  interactable.options.test = {};
  interactable.rectChecker(() => rect);

  // modify move coords
  scope.interactions.signals.on('before-action-move', ({ interaction }) => {
    interaction.curCoords.page = {
      x: rect.left + 100,
      y: rect.top - 50,
    };
  });

  interactable.reflow({ name: 'test' });

  const phases = ['reflow', 'start', 'move', 'end'];

  for (const [index, phase] of Object.entries(phases)) {
    t.equal(fired[index].type, `test${phase}`, `event #${index} is ${phase}`);
  }

  const interaction = fired[0].interaction;

  t.deepEqual(
    interaction.startCoords.page,
    {
      x: rect.left,
      y: rect.top,
    },
    'uses element top left for event coords'
  );

  const reflowMove = fired[2];

  t.deepEqual(
    reflowMove.delta,
    { x: 100, y: -50 },
    'move delta is correct with modified interaction coords'
  );

  t.notOk(
    interaction.pointerIsDown,
    'reflow pointer was lifted'
  );

  t.equal(
    interaction.pointers.length,
    0,
    'reflow pointer was removed from interaction'
  );

  t.notOk(
    scope.interactions.list.includes(interaction),
    'interaction is removed from list'
  );

  t.end();
});

test('async reflow', async t => {
  const scope = helpers.mockScope();

  interactions.init(scope);

  Object.assign(scope.actions, { test: {}, names: ['test'] });

  let reflowEvent;
  let promise;

  const interactable = scope.interactables.new(win.window);
  const rect = Object.freeze({ top: 100, left: 200, bottom: 300, right: 400 });
  interactable.rectChecker(() => rect);
  interactable.fire = iEvent => { reflowEvent = iEvent; };

  reflow.init(scope);

  promise = interactable.reflow({ name: 'test' });
  t.ok(promise instanceof win.window.Promise, 'method returns a Promise');
  t.notOk(reflowEvent.interaction.interacting(), 'reflow may end synchronously');

  t.equal(await promise, interactable, 'returned Promise resolves to interactable');

  // block the end of the reflow interaction and stop it after a timeout
  scope.interactions.signals.on('before-action-end', ({ interaction }) => {
    setTimeout(() => interaction.stop(), 0);
    return false;
  });

  promise = interactable.reflow({ name: 'test' });

  t.ok(reflowEvent.interaction.interacting(), 'interaction continues if end is blocked');
  await promise;
  t.notOk(reflowEvent.interaction.interacting(), 'interaction is stopped after promise is resolved');

  t.end();
});
