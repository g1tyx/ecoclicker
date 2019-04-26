(function() {

    var binding = bloom.ns('binding'),
        string = bloom.ns('utilities.string'),
        dom = bloom.ns('utilities.dom'),
        handlers;

    binding.unwrap = function(observable) {
        if (typeof observable === 'function') {
            return observable();
        }
        return observable;
    };

    binding.observable = function(value) {
        var listeners = [];

        function notify(newValue) {
            listeners.forEach(function(listener){
                listener(newValue);
            });
        }

        function accessor(newValue) {
            if (arguments.length && newValue !== value) {
              value = newValue;
              notify(newValue);
            }
            return value;
        }

        accessor.subscribe = function(listener) {
            listeners.push(listener);

            return {
                dispose: function() {
                    listeners.splice(listeners.indexOf(listener), 1);
                }
            };
        };

        accessor.isObservable = true;

        return accessor;
    };

    handlers = {
        text: function(el, observable) {
            return {
                subscription: null,
                init: function() {
                    this.update(binding.unwrap(observable));

                    if (observable.isObservable) {
                        this.subscription = observable.subscribe(this.update.bind(this));
                    }
                },
                update: function(value) {
                    el.textContent = value;
                },
                cleanup: function() {
                    if (!!this.subscription) {
                        this.subscription.dispose();
                    }
                }
            };
        },
        click: function(el, f) {
            return {
                cb: null,
                init: function() {
                    this.cb = this.click.bind(this);
                    el.addEventListener('click', this.cb);
                },
                click: function() {
                    f();
                },
                cleanup: function() {
                    if (!!this.cb) {
                        el.removeEventListener('click', this.cb);
                        this.cb = null;
                    }
                }
            };
        }
    };

    binding.handlers = handlers;

    binding.apply = function(el, context) {
        var els = dom.all('[data-x]', el),
            i,
            l = els.length,
            binded,
            b;

        for (i = 0; i < l; i += 1) {
            binded = els[i];
            b = binded.getAttribute('data-x');
            binding.applyToElement(binded, context, binding.parseBindings(b));
        }
    };

    binding.applyToElement = function(el, context, bindings) {
        var i, l = bindings.length,
            b,
            handler,
            actualBinding,
            value,
            valueRef;
        for (i = 0; i < l; i += 1) {
            b = bindings[i];
            handler = b.handler;
            value = b.value;
            if (!handlers.hasOwnProperty(handler)) {
                throw new Error(string.format('Handler with id "{0}" not found', handler));
            }
            if (typeof context[value] === 'undefined') {
                throw new Error(string.format('Context property "{0}" not found', value));
            }
            if (typeof context[value] === 'function' && !context[value].isObservable) {
                valueRef = context[value].bind(context);
            } else {
                valueRef = context[value];
            }
            actualBinding = handlers[handler](el, valueRef);
            if (actualBinding.hasOwnProperty('init')) {
                actualBinding.init();
            }
        }
    };

    binding.parseBindings = function(b) {
        var b = b.split(','),
            bi,
            result = [],
            i,
            l = b.length;

        for (i = 0; i < l; i += 1) {
            bi = b[i].split(':');
            result.push({
                handler: (bi[0] || '').trim(),
                value: (bi[1] || '').trim()
            });
        }

        return result;
    };

    binding.clean = function(el) {

    };



}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.ns('core');

    core.Component = function () {

    };
    core.Component.prototype.actor = null;
    core.Component.prototype.state = null;
    core.Component.prototype.getLayer = function () {
        if (this.actor) {
            return this.actor.layer;
        }
        return null;
    };
    core.Component.prototype.getComponent = function (constructor) {
        if (this.actor) {
            return this.actor.getComponent(constructor);
        }
        return null;
    };
    core.Component.prototype.get = core.Component.prototype.getComponent;
    core.Component.prototype.getActor = function () {
        return this.actor;
    };
    core.Component.prototype.getLayer = function () {
        return this.actor.layer;
    };
    core.Component.prototype.getScene = function () {
        return this.actor.layer.scene;
    };
    core.Component.prototype.getGame = function () {
        return this.actor.layer.scene.game;
    };
}());



(function() {
    var core = bloom.ns('core'),
        array = bloom.ns('utilities.array'),
        string = bloom.ns('utilities.string');

    /**
     * Every object in a game is an entity.
     *
     */
    core.Entity = function(opts) {
        this.components = [];
        this.layer = null;
        this.state = !!opts && opts.hasOwnProperty('state') ? opts.state : new core.State();
        this.id = !!opts && opts.hasOwnProperty('id') ? opts.id : string.uid();
    };

    core.Entity.prototype.play = function() {
        array.apply(this.components, 'play');
    };

    core.Entity.prototype.pause = function() {
        array.apply(this.components, 'pause');
    };

    core.Entity.prototype.getGame = function() {
        return this.layer.scene.game;
    };

    core.Entity.prototype.getLoader = function() {
        return this.getGame().loader;
    };
    core.Entity.prototype.getManifest = function() {
        return this.getGame().manifest;
    };

    core.Entity.prototype.requireRedraw = function() {
        var cs = this.components,
            i,
            l = cs.length;
        for (i = 0; i < l; i += 1) {
            if (typeof cs[i].requireRedraw === 'function') {
                cs[i].requireRedraw();
            }
        }
    };

    core.Entity.prototype.getComponent = function(constructor) {
        var cs = this.components,
            i,
            l = cs.length;
        for (i = 0; i < l; i += 1) {
            if (cs[i] instanceof constructor) {
                return cs[i];
            }
        }
        return null;
    };

    core.Entity.prototype.get = core.Entity.prototype.getComponent;

    core.Entity.prototype.add = function(component, opts) {
        if (!component) {
            throw new Error('Component is undefined');
        }
        if (typeof component === 'function') {
            component = new component(opts);
        }
        this.components.push(component);
        if (component.state === null) {
            component.state = this.state;
        }
        component.actor = this;
        this.layer.registerComponent(component);

        return this;
    };

    core.Entity.prototype.markForRemoval = function() {
        this.layer.markForRemoval(this);
    };
    core.Entity.prototype.removeFromLayer = function() {
        if (this.layer) {
            this.layer.remove(this);
        }
    };

    core.Entity.prototype.remove = function(component) {
        if (!component) {
            return;
        }
        var cs = this.components,
            i = cs.indexOf(component);
        if (i > -1) {
            cs.splice(i, 1);
        }
        component.state = null;
        component.actor = null;
        this.layer.unregisterComponent(component);
    };
}());



(function() {
    var core = bloom.ns('core'),
        network = bloom.ns('network'),
        sound = bloom.ns('sound'),
        dom = bloom.ns('utilities.dom'),
        string = bloom.ns('utilities.string');

    core.instances = [];

    /**
     * A game is a holder for the scenes. It allows to
     * navigate between each scene. It's also the initiator
     * of the main loop for each game.
     *
     */
    core.Game = function(initializer) {
        this.current = null;
        this.scenes = [];
        this.scenesById = {};
        this.loader = null;
        this.manifest = null;
        this.paused = false;
        this.ts = 0;
        core.instances.push(this);

        if (initializer instanceof core.GameInitializer) {
            this.loader = initializer.loader;
            this.manifest = initializer.manifest;
        }

        this.sounds = new sound.SoundStore({
            manifest: this.manifest
        });

        dom.get('#wrapper').innerHTML = '';
    };

    core.Game.prototype.apply = function(scene, f, id, opts) {
        if (!scene) {
            return;
        }
        if (f === 'end' && typeof scene.endTransition === 'function') {
            scene.endTransition(function() {
                scene.applyAutoRemoval();
                if (typeof scene[f] === 'function') {
                    scene.end(opts);
                }
            }, id, opts);
            return;
        }
        if (typeof scene[f] === 'function') {
            if (f === 'end') {
                scene.applyAutoRemoval();
            }
            scene[f](opts);
        }
        if (f === 'start' && typeof scene.startTransition === 'function') {
            scene.startTransition(id, opts);
        }
    };

    core.Game.prototype.start = function (id) {
        if (!this.scenes.length) {
            throw new Error('No scene to start with!');
        }
        if (this.current === null) {
            this.goto(id || 'main');
        }
    };
    core.Game.prototype.goto = function(id, opts) {
        var currentId = null;
        if (this.current !== null) {
            currentId = this.current.id;
            this.apply(this.current, 'end', id);
            this.current = null;
        } else {
            dom.get('#wrapper').innerHTML = '';
        }
        if (!this.scenesById.hasOwnProperty(id)) {
            console.warn('Scene not found: "' + id + '"');
            return;
        }

        this.current = this.scenesById[id];
        this.apply(this.current, 'start', currentId, opts);
        if (!!this.paused) {
            this.play();
        }
    };
    core.Game.prototype.pause = function() {
        if (!this.paused) {
            this.paused = true;
            this.apply(this.current, 'triggerPause');
        }
    };
    core.Game.prototype.play = function() {
        if (!!this.paused) {
            this.paused = false;
            this.apply(this.current, 'triggerPlay');
        }
    };
    core.Game.prototype.switchPause = function() {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    };
    core.Game.prototype.update = function (time, delta) {
        this.delta = time - this.ts;
        this.ts = time;
        if (!!this.paused) {
            return;
        }
        if (this.current !== null) {
            this.current.update(time, this.delta);
        }
    };
    core.Game.prototype.add = function(scene) {
        if (!(scene instanceof core.Scene)) {
            throw new Error('Given scene must be a bloom.core.Scene instance');
        }
        var id,
            sbi = this.scenesById,
            scs = this.scenes;

        if (!scene.id && !scs.length) {
            scene.id = 'main';
        }
        id = scene.id;
        if (!id) {
            throw new Error('Scene requires an ID');
        }

        scene.game = this;

        if (sbi.hasOwnProperty(id)) {
            if (sbi[id] !== scene) {
                throw new Error(string.format('Another scene already has ID "{0}". Each scene ID must be unique.', id));
            }
        } else {
            scs.push(scene);
            sbi[id] = scene;
        }
    };
    core.Game.prototype.remove = function(scene) {
        if (!(scene instanceof core.Scene)) {
            throw new Error('Given scene must be a bloom.core.Scene instance');
        }

        scene.game = null;

        var i = this.scenes.indexOf(scene);
        if (i > -1) {
            this.scenes.splice(i, 1);
        }
        if (this.scenesById.hasOwnProperty(scene.id)) {
            delete this.scenesById[scene.id];
        }
    };
    core.Game.prototype.end = function() {
        var is = core.instances,
            i = is.indexOf(this);
        if (i > -1) {
            is.splice(i, 1);
        }
        this.current = null;
    };

}());



(function() {
    var core = bloom.ns('core'),
        array = bloom.ns('utilities.array');

    core.Layer = function(opts) {
        this.actorsById = {};
        this.actors = [];
        this.updatable = [];
        this.fixedUpdatable = [];
        this.removable = [];
        this.scene = null;
        this.dummy = null;
        this.element = null;
        this.paused = false;
        this.id = opts && opts.hasOwnProperty('id') ? opts.id : null;
    };

    core.Layer.prototype.getElement = function() {
        return this.element;
    };
    core.Layer.prototype.play = function() {
        if (this.paused) {
            this.paused = false;
            array.apply(this.actors, 'play');
        }
    };

    core.Layer.prototype.pause = function() {
        if (!this.paused) {
            this.paused = true;
            array.apply(this.actors, 'pause');
        }
    };

    core.Layer.prototype.create = function(opts) {
        return this.add(core.Entity, opts);
    };
    core.Layer.prototype.add = function(actor, opts) {

        if (typeof actor === 'function') {
            actor = new actor(opts);
        }

        if (actor instanceof core.Component) {
            this.addComponent(actor);
            return;
        }
        if (this.actorsById.hasOwnProperty(actor.id) && actor !== this.actorsById[actor.id]) {
            throw new Error('An actor with the same id "' + actor.id + '" has already been registered. [Layer#' + this.id+']');
        }
        this.actorsById[actor.id] = actor;
        this.actors.push(actor);
        actor.layer = this;

        if (typeof actor.update === 'function') {
            this.updatable.push(actor);
        }
        if (typeof actor.fixedUpdate === 'function') {
            this.fixedUpdatable.push(actor);
        }
        if (typeof actor.start === 'function') {
            actor.start();
        }
        if (this.paused && typeof actor.pause === 'function') {
            actor.pause();
        }

        return actor;
    };


    core.Layer.prototype.update = function(time, delta) {
        if (this.paused) {
            return;
        }

        var updatables = this.updatable,
            i,
            l = updatables.length;

        for (i = 0; i < l; i += 1) {
            this.removedSpy = false;
            updatables[i].update(time, delta);
            if (this.removedSpy) {
                i -= 1;
                l -= 1;
            }
        };

        for (i = 0, l = this.removable.length; i < l; i += 1) {
            this.remove(this.removable[i]);
        }
        if (l) {
            this.removable.length = 0;
        }
    };


    core.Layer.prototype.fixedUpdate = function() {
        if (this.paused) {
            return;
        }

        var fUpdatables = this.fixedUpdatable,
            i,
            l = fUpdatables.length;

        for (i = 0; i < l; i += 1) {
            this.removedSpy = false;
            fUpdatables[i].fixedUpdate();
            if (this.removedSpy) {
                i -= 1;
                l -= 1;
            }
        };

        for (i = 0, l = this.removable.length; i < l; i += 1) {
            this.remove(this.removable[i]);
        }
        if (l) {
            this.removable.length = 0;
        }
    };
    core.Layer.prototype.markForRemoval = function(actor) {
        this.removable.push(actor);
    };
    core.Layer.prototype.removeAll = function() {
        var a = this.actors,
            i,
            l = a.length;

        for (i = l - 1; i >= 0; i -= 1) {
            this.remove(a[i]);
        }

    };
    core.Layer.prototype.remove = function(actor) {
        if (actor instanceof core.Component) {
            this.removeComponent(actor);
            return;
        } else if (typeof actor === 'function') {
            actor = this.getActor(actor);
        }

        var os = this.actors,
            us = this.updatable,
            i;

        if (typeof actor.end === 'function') {
            actor.end();
        }

        this.unregisterComponentOf(actor);

        actor.layer = null;

        i = os.indexOf(actor);
        if (i > -1) {
            os.splice(i, 1);
        }

        i = us.indexOf(actor);
        if (i > -1) {
            this.removedSpy = true;
            us.splice(i, 1);
        }
    };

    core.Layer.prototype.getActor = function(constructorOrId) {
        if (typeof constructorOrId === 'string') {
            return this.actorsById.hasOwnProperty(constructorOrId) ?
                    this.actorsById[constructorOrId] : null;
        }

        var as = this.actors,
            i,
            l = as.length;
        for (i = 0; i < l; i += 1) {
            if (as[i] instanceof constructor) {
                return as[i];
            }
        }
        return null;
    };
    core.Layer.prototype.get = core.Layer.prototype.getActor;

    core.Layer.prototype.getComponents = function(constructor, excludingFor) {
        var as = this.actors,
            result = [],
            c,
            i,
            l = as.length;

        for (i = 0; i < l; i += 1) {
            if (as[i] !== excludingFor) {
                c = as[i].getComponent(constructor);
                if (!!c) {
                    result.push(c);
                }
            }
        }
        return result;
    };
    core.Layer.prototype.getActors = function(constructor) {
        var as = this.actors,
            result = [],
            c,
            i,
            l = as.length;

        for (i = 0; i < l; i += 1) {
            if (as[i] instanceof constructor) {
                result.push(as[i]);
            }
        }
        return result;
    };
    core.Layer.prototype.addComponent = function(component) {
        if (!this.dummy) {
            this.dummy = new core.Entity();
            this.add(this.dummy);
        }
        this.dummy.add(component);
    };
    core.Layer.prototype.removeComponent = function(component) {
        if (!!this.dummy) {
            this.dummy.remove(component);
        }
    };

    core.Layer.prototype.registerComponent = function(component) {
        if (typeof component.start === 'function') {
            component.start();
        }
        this.attachComponent(component);
        if (typeof component.update === 'function') {
            this.updatable.push(component);
        }
        if (typeof component.fixedUpdate === 'function') {
            this.fixedUpdatable.push(component);
        }
    };
    core.Layer.prototype.unregisterComponentOf = function(actor) {
        var ccs = actor.components, i, l = ccs.length;
        for (i = 0; i < l; i += 1) {
            this.unregisterComponent(ccs[i]);
        }
    };
    core.Layer.prototype.unregisterComponent = function(component) {
        var us = this.updatable,
            fus = this.fixedUpdatable,
            i;

        if (typeof component.end === 'function') {
            component.end();
        }

        this.detachComponent(component);

        if (typeof component.update === 'function') {
            i = us.indexOf(component);
            if (i > -1) {
                us.splice(i, 1);
            }
        }
        if (typeof component.fixedUpdatable === 'function') {
            i = fus.indexOf(component);
            if (i > -1) {
                fus.splice(i, 1);
            }
        }
    };
    core.Layer.prototype.attachComponent = function(component) {};
    core.Layer.prototype.detachComponent = function(component) {};

}());



(function() {
    var core = bloom.ns('core'),
        array = bloom.ns('utilities.array');

    core.Scene = function(options) {
        this.id = null;
        this.game = null;
        this.layer = null;
        this.layers = [];
        this.paused = false;
        this.autoRemoval = true;
        if (!!options) {
            if (options.hasOwnProperty('id')) {
                this.id = options.id;
            }
        }
    };
    core.Scene.prototype.getLoader = function() {
        return this.game.loader;
    };
    core.Scene.prototype.getManifest = function() {
        return this.game.manifest;
    };


    core.Scene.prototype.triggerPlay = function() {
        array.apply(this.layers, 'play');
        if (typeof this.play === 'function') {
            this.play();
        }
    };

    core.Scene.prototype.triggerPause = function() {
        array.apply(this.layers, 'pause');
        if (typeof this.pause === 'function') {
            this.pause();
        }
    };

    core.Scene.prototype.update = function (time, delta) {
        var ls = this.layers, i, l = ls.length;
        for (i = 0; i < l; i += 1) {
            ls[i].update(time, delta);
        }
    };
    core.Scene.prototype.fixedUpdate = function () {
        var ls = this.layers, i, l = ls.length;
        for (i = 0; i < l; i += 1) {
            ls[i].fixedUpdate();
        }
    };
    core.Scene.prototype.add = function(layer) {
        if (!(layer instanceof core.Layer)) {
            throw new Error('Given layer must be a bloom.core.Layer instance');
        }
        this.layer = layer;
        layer.scene = this;
        this.layers.push(layer);
        if (typeof layer.start === 'function') {
            layer.start();
        }
    };
    core.Scene.prototype.applyAutoRemoval = function() {
        if (!this.autoRemoval) {
            return;
        }
        var ls = this.layers, l;
        for (l = ls.length - 1; l >= 0; l -= 1) {
            this.remove(ls[l]);
        }
    };
    core.Scene.prototype.remove = function(layer) {
        if (!(layer instanceof core.Layer)) {
            throw new Error('Given layer must be a bloom.core.Layer instance');
        }

        layer.scene = null;
        if (typeof layer.end === 'function') {
            layer.end();
        }
        var i = this.layers.indexOf(layer);
        if (i > -1) {
            this.layers.splice(i, 1);
        }
    };
    core.Scene.prototype.destroy = function() {
        this.layers = null;
    };

}());

(function() {
    var core = bloom.ns('core');
    core.Sprite = function(opts) {
        this.id = opts && opts.hasOwnProperty('id') ? opts.id : null;
        this.image = null;
        if (opts && opts.hasOwnProperty('data')) {
          this.image = opts.data;
        }
    };
}());
(function() {
    var core = bloom.ns('core'),
        dom = bloom.require('utilities.dom');
    core.SpriteAtlas = function(opts, data) {
        this.id = opts && opts.hasOwnProperty('id') ? opts.id : null;
        this.image = null;
        this.imageDatas = {};
        this.images = {};
        if (opts && opts.hasOwnProperty('data')) {
            this.image = opts.data;
        }
        if (opts && opts.hasOwnProperty('definition')) {
           this.definition = opts.definition;
        } else {
            this.definition = {};
        }
        this.generate();
    };

    core.SpriteAtlas.prototype.generate = function() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.drawImage(this.image, 0, 0);

        document.body.appendChild(this.canvas);
    };

    core.SpriteAtlas.prototype.generateImageData = function(id) {
        if (this.imageDatas.hasOwnProperty(id)) {
            return;
        }
        if (!this.definition.hasOwnProperty(id)) {
            console.warn('No definition for atlas tile "' + id + '" [Atlas#' + this.id + ']');
            return;
        }
        var def = this.definition[id];
        this.imageDatas[id] = this.ctx.getImageData(def[0], def[1], def[2], def[3]);
        dom.get('#map').getContext('2d').putImageData(this.imageDatas[id], 20, 20);
    };
    core.SpriteAtlas.prototype.getImage = function(id) {
        if (this.images.hasOwnProperty(id)) {
            return this.images[id];
        }

        var img = document.createElement("img"),
            canvas = document.createElement("canvas"),
            data = this.getImageData(id),
            ctx;

        canvas.width = data.width;
        canvas.height = data.height;
        ctx = canvas.getContext("2d");
        ctx.putImageData(data, 0, 0);
        img.src = canvas.toDataURL("image/png");
        this.images[id] = img;
        return img;
    };
    core.SpriteAtlas.prototype.getImageData = function(id) {
        if (!this.imageDatas.hasOwnProperty(id)) {
            this.generateImageData(id);
        }
        return this.imageDatas[id] || null;
    };

}());


(function() {
    var core = bloom.ns('core');

    core.State = function (initialValues) {
        bloom.EventDispatcher.call(this);
        this.v = {};

        if (typeof initialValues === 'object') {
            this.setAll(initialValues);
        };
    };

    bloom.inherits(core.State, bloom.EventDispatcher);

    core.State.prototype.increment = function(key, value) {
        if (!this.has(key)) {
            this.set(key, 0);
        }
        return this.set(key, this.get(key) + (typeof value === 'number' ? value : 1));
    };
    core.State.prototype.decrement = function(key, value) {
        if (!this.has(key)) {
            this.set(key, 0);
        }
        return this.set(key, this.get(key) - (typeof value === 'number' ? value : 1));
    };
    core.State.prototype.setAll = function(values) {
        for (var k in values) {
            if (values.hasOwnProperty(k)) {
                this.set(k, values[k]);
            }
        }
    };
    core.State.prototype.set = function(key, value) {
        if (this.v[key] !== value) {
            this.v[key] = value;
            var e = {
                type: 'change',
                key: key,
                value: value,
                state: this
            };
            this.dispatch(e);
        }
        return value;
    };

    core.State.prototype.has = function(key) {
        return this.v.hasOwnProperty(key);
    };
    core.State.prototype.get = function(key) {
        var v = this.v;
        if (!v.hasOwnProperty(key)) {
            if (arguments.length > 1) {
                return arguments[1];
            }
            return null;
        }
        return this.v[key];
    };

    core.State.prototype.all = function() {
        return this.v;
    };

    core.State.prototype.toJSON = function() {
        return JSON.stringify(this.v);
    };

    core.State.prototype.fromJSONString = function(data) {
        this.setAll(JSON.parse(data));
    };

    core.State.prototype.export = function() {
        // most efficient way to deep clone an object
        // and filter out funcs, DOM elements...
        // it's faster as it's run natively by the browser
        return JSON.parse(JSON.stringify(this.v));
    };

    core.State.prototype.import = function(o) {
        var k,
            v = this.v;

        for (k in o) {
            if (o.hasOwnProperty(k) && this.has(k)) {
                v[k] = o[k];
            }
        }
    };

}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.ns('core');

    core.Vector = function (x, y, z) {
        if (typeof x === 'number') {
            this.x = x;
        }
        if (typeof y === 'number') {
            this.y = y;
        }
        if (typeof z === 'number') {
            this.z = z;
        }
    };

    core.Vector.prototype.x = 0;
    core.Vector.prototype.y = 0;
    core.Vector.prototype.z = 0;

    core.Vector.prototype.clone = function () {
        return new core.Vector(this.x, this.y, this.z);
    };

    core.Vector.prototype.set = function (x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        return this;
    };
    core.Vector.prototype.copy = function (vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        return this;
    };
    core.Vector.prototype.add = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    };
    core.Vector.prototype.multiplyScalar = function (v) {
        this.x *= v;
        this.y *= v;
        this.z *= v;
        return this;
    };
    core.Vector.prototype.multiply = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        return this;
    };
    core.Vector.prototype.divideScalar = function (v) {
        this.x /= v;
        this.y /= v;
        this.z /= v;
        return this;
    };
    core.Vector.prototype.divide = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        return this;
    };

}());

/*global bloom, requestAnimationFrame*/
(function () {
    'use strict';

    var loop = bloom.ns('core.loop'),
        debug = bloom.ns('core.debug'),
        tween = bloom.ns('tween'),
        core = bloom.ns('core'),

        instances = core.instances,
        i,
        l,

        delta,
        ts = 0,
        tweener,

        fps = 40,
        interval = 1000 / fps;

    loop.animate = function (time) {

        requestAnimationFrame(loop.animate);

        delta = time - ts;

        if (delta > interval) {
            // if (capped > 0 && cap > 0) {
            //     cap -= 1;
            //     return;
            // }
            // cap = capped;

            ts = time - (delta % interval);

            if (!tweener) {
                tweener = tween.tweener;
            } else {
                tweener.update(ts, delta);
            }

            for (i = 0, l = instances.length; i < l; i += 1) {
                instances[i].update(ts);
            }

        }
    };

    loop.animate(0);
}());


(function() {
    var input = bloom.ns('input'),
        keyboard = bloom.ns('input.keyboard');



}());


(function() {
    var keyboard = bloom.ns('input.keyboard'),
        dom = bloom.ns('utilities.dom'),
        dispatcher = new bloom.EventDispatcher(),

        map = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'ins',
            46: 'del',
            91: 'meta',
            93: 'meta',
            224: 'meta'
        },
        shift = false,
        keys = [],

        nextNormalCode = null,
        whichToCode = {};

    (function() {
        var key;
        for (k in map) {
            if (map.hasOwnProperty(k)) {
                key = map[k];
                keyboard[key.toUpperCase()] = key;
            }
        }
    }());

    keyboard.getKey = function(key) {
        return keys.indexOf(key) > -1;
    };

    keyboard.on = dispatcher.on.bind(dispatcher);
    keyboard.off = dispatcher.off.bind(dispatcher);

    dom.on('keydown', function(e) {
        var key,
            i;

        if (!map.hasOwnProperty(e.which)) {
            nextNormalCode = e.which;
            return;
        }

        key = map[e.which];
        i = keys.indexOf(key);
        if (i === -1) {
            keys.push(key);
        }

        dispatcher.dispatch({
            type: 'keydown',
            key: key,
            keys: keys
        });
    });
    dom.on('keypress', function(e) {

        if (map.hasOwnProperty(e.which)) {
            return;
        }

        var key = String.fromCharCode(e.which),
            i = keys.indexOf(key);

        if (!key) {
            return;
        }
        if (i === -1) {
            keys.push(key);
        }


        if (!whichToCode.hasOwnProperty(e.which) && !!nextNormalCode) {
            whichToCode[nextNormalCode] = key;
        }

        nextNormalCode = null;
        dispatcher.dispatch({
            type: 'keydown',
            key: key,
            keys: keys
        });
    });
    dom.on('keyup', function(e) {
        var key,
            i;
        if (!!map.hasOwnProperty(e.which)) {
            key = map[e.which];
        } else if (whichToCode.hasOwnProperty(e.which)) {
            key = whichToCode[e.which];
        }
        i = keys.indexOf(key);
        if (i > -1) {
            while (i > -1) {
                keys.splice(i, 1);
                i = keys.indexOf(key)
            }
            dispatcher.dispatch({
                type: 'keyup',
                key: key,
                keys: keys
            });
        }
    });

}());


/*global bloom*/
(function () {
    'use strict';

    var particles = bloom.ns('particles'),
        core = bloom.ns('core');

    particles.Emitter = function (opts) {
        this.position = opts && opts.hasOwnProperty('position') ? opts.position : new core.Vector();
        this.num = opts && opts.hasOwnProperty('num') ? opts.num : 10;
        this.lifetime = opts && opts.hasOwnProperty('lifetime') ? opts.lifetime : 1000;
        this.constr = particles.Particle;
    };

    particles.Emitter.prototype.emit = function (system, num, factory) {
        var p;
        while (num >= 0) {
            p = this.create(system, factory);
            num -= 1;
        }
    };

    particles.Emitter.prototype.create = function (system, factory) {
        var p = !!factory ? factory() : new this.constr();
        if (!!this.position && !p.position) {
            p.position.copy(this.position);
        }
        if (p.lifetime === null) {
            p.lifetime = this.lifetime;
        }
        system.add(p);
        return p;
    };


    particles.Emitter.prototype.end = function () {
        if (!!this.position) {
            this.position = null;
        }
    };

}());
/*global bloom*/
(function () {
    'use strict';

    var particles = bloom.ns('particles'),
        core = bloom.ns('core');

    particles.Particle = function (opts) {
        this.lifetime = opts && opts.hasOwnProperty('lifetime') ? opts.lifetime : 1000;
        this.lt = 0;
        this.position = opts && opts.hasOwnProperty('position') ? opts.position : new core.Vector();
        this.rotation = opts && opts.hasOwnProperty('rotation') ? opts.rotation : 0;
        this.rot = 0;
        this.velocity = opts && opts.hasOwnProperty('velocity') ? opts.velocity : null;
        this.delay = opts && opts.hasOwnProperty('delay') ? opts.delay : 0;
        this.opacity = 1;
        this.mass = opts && opts.hasOwnProperty('mass') ? opts.mass : 1.5;
        this.disappear = opts && opts.hasOwnProperty('disappear') ? opts.disappear : -1;
        this.start();
    };

    particles.Particle.prototype.start = function () {
    };
    particles.Particle.prototype.update = function () {
    };
    particles.Particle.prototype.end = function () {
    };

    particles.Particle.prototype.pUpdate = function (system, delta, wind, gravity) {
        var p = this.position,
            d = this.delay,
            v = this.velocity,
            r = this.rotation,
            dis = this.disappear,
            disd,
            b;

        if (d > 0) {
            d -= delta;
            this.delay = d;
            if (d > 0) {
                return true;
            } else {
                this.start();
            }
        }

        this.lt += delta;
        if (this.lt >= this.lifetime) {
            return false;
        }

        this.rot += r;
        if (dis > -1) {
            disd = this.lifetime - dis;
            if (this.lt > disd) {
                this.opacity = 1 - (this.lt - disd) / dis;
            }
        }
        p.add(wind)
            .add(gravity);

        if (!!v) {
            p.add(v);
            v.divideScalar(this.mass);
        }

        b = this.update();
        return typeof b === 'boolean' ? b : true;
    };

    particles.Particle.prototype.pEnd = function () {
        this.end();
        if (!!this.position) {
            this.position = null;
        }
    };

}());
/*global bloom*/
(function () {
    'use strict';

    var particles = bloom.ns('particles'),
        dom = bloom.ns('utilities.dom'),
        core = bloom.ns('core');

    particles.ParticleHTML = function (opts) {
        particles.Particle.call(this, opts);
        this.classname = opts && opts.hasOwnProperty('classname') ? opts.classname : '';
        this.content = opts && opts.hasOwnProperty('content') ? opts.content : '';
        this.container = opts && opts.hasOwnProperty('container') ? opts.container : null;
    };

    bloom.inherits(particles.ParticleHTML, particles.Particle);

    particles.ParticleHTML.prototype.start = function () {
        this.element = dom.create('span', {
            'class': 'particle ' + this.classname,
            innerHTML: this.content
        });
        if (!!this.container) {
            this.container.appendChild(this.element);
        }
    };

    particles.ParticleHTML.prototype.update = function () {
        var s = this.element.style,
            p = this.position,
            r = this.rot,
            o = this.opacity;

        s.left = p.x + 'px';
        s.bottom = p.y + 'px';
        if (!!r) {
            s.transform = 'rotate(' + r + 'deg)';
        }
        if (!!o && o < 1) {
            s.opacity = o;
        }
    };

    particles.ParticleHTML.prototype.end = function () {
        var e = this.element;
        if (!!e) {
            if (e.parentNode) {
                e.parentNode.removeChild(e);
            }
            this.element = null;
        }
        if (!!this.container) {
            this.container = null;
        }
    };


}());
/*global bloom*/
(function () {
    'use strict';

    var particles = bloom.ns('particles'),
        core = bloom.ns('core');

    particles.System = function () {
        this.gravity = new core.Vector(0, -1);
        this.wind = new core.Vector();
        this.particles = [];
    };


    particles.System.prototype.add = function (p) {
        if (p.delay === 0) {
            p.start();
        }
        this.particles.push(p);
    };

    particles.System.prototype.update = function (time, delta) {
        var ps = this.particles,
            p,
            i,
            l = ps.length,
            currWind = this.wind.clone().multiplyScalar(delta / 10),
            currGravity = this.gravity.clone().multiplyScalar(delta / 10);

        for (i = l - 1; i >= 0; i -= 1) {
            p = ps[i];
            if (!p.pUpdate(this, delta, currWind, currGravity)) {
                p.pEnd();
                ps.splice(i, 1);
            }
        }
    };
    particles.System.prototype.end = function (p) {
        var ps = this.particles,
            i,
            l = ps.length;
        for (i = l - 1; i >= 0; i -= 1) {
            ps[i].pEnd();
        }
    };


}());


(function() {
    var core = bloom.ns('core');

    core.SaveStrategy = function (opts) {
        bloom.EventDispatcher.call(this);
        this.id = opts && opts.hasOwnProperty('id') ? opts.id : null;
        this.state = opts && opts.hasOwnProperty('state') ? opts.state : null;
        this.autoload = opts && opts.hasOwnProperty('autoload') ? !!opts.autoload : false;

        if (!!this.id && !!this.state && this.autoload) {
            this.load();
        }
    };

    bloom.inherits(core.SaveStrategy, bloom.EventDispatcher);

    core.SaveStrategy.prototype.save = function() {};

    core.SaveStrategy.prototype.load = function() {};
}());


(function() {
    var core = bloom.ns('core');

    core.LocalStorageStrategy = function () {
        core.SaveStrategy.apply(this, arguments);
    };

    bloom.inherits(core.LocalStorageStrategy, core.SaveStrategy);

    core.LocalStorageStrategy.prototype.save = function(strData) {
        if (this.id === null) {
            console.warn('No identifier for save strategy');
            return;
        }
        if (!strData && !this.state) {
            console.warn('No data or state to save');
            return;
        }

        localStorage.setItem(this.id, strData || this.state.toJSON())
    };

    core.LocalStorageStrategy.prototype.exists = function() {
        if (this.id === null) {
            console.warn('No identifier for save strategy');
            return;
        }

        return localStorage.getItem(this.id) !== null;
    };

    core.LocalStorageStrategy.prototype.load = function() {
        if (this.id === null) {
            console.warn('No identifier for save strategy');
            return;
        }

        var v = localStorage.getItem(this.id);

        if (!!v && !!this.state) {
            this.state.fromJSONString(v);
            return this.state;
        }

        return v;
    };
}());


(function() {
    var sound = bloom.ns('sound'),
        tween = bloom.ns('tween'),
        dom = bloom.ns('utilities.dom');

    sound.Sound = function(options) {
        bloom.EventDispatcher.call(this);
        this.id = options.id;
        this.volume = options.volume || 1;
        this.loop = !!options.loop;
        this.tween = null;
        this.element = dom.create('audio', {
            src: options.url
        });
        console.log(this.loop, this.id);
        this.element.loop = this.loop;
        this.setVolume(this.volume);


        this.element.addEventListener('playing', function() {
            console.log('Start playing', this.id);
        }.bind(this));
        this.element.addEventListener('pause', function() {
            console.log('Stopped playing', this.id);
        }.bind(this));
        this.element.addEventListener('suspend', function() {
            console.log('Suspend', this.id);
        }.bind(this));
    };

    bloom.inherits(sound.Sound, bloom.EventDispatcher);

    sound.Sound.prototype.autoRelease = true;
    sound.Sound.prototype.loop = false;
    sound.Sound.prototype.volume = 1;
    sound.Sound.prototype.pan = 0;
    sound.Sound.prototype.play = function() {
        this.element.play();
    };
    sound.Sound.prototype.pause = function() {
        this.element.pause();
    };
    sound.Sound.prototype.stop = function() {
        this.element.pause();
        this.rewind();
    };
    sound.Sound.prototype.fadeIn = function() {
        this.element.play();
        if (this.getVolume() < 1) {

        }
        this.tween = tween.get(this.getVolume(), 1)
    };
    sound.Sound.prototype.fadeOut = function() {

    };
    sound.Sound.prototype.rewind = function() {
        this.element.currentTime = 0;
    };
    sound.Sound.prototype.setVolume = function(volume) {
        this.volume = volume;
        this.element.volume = volume;
    };
    sound.Sound.prototype.getVolume = function() {
        return this.volume;
    };
    sound.Sound.prototype.setLoop = function(loop) {
        this.loop = loop;
        this.element.loop = loop;
    };
    sound.Sound.prototype.getLoop = function() {
        return this.loop;
    };
    sound.Sound.prototype.panTo = function() {

    };
    sound.Sound.prototype.invertPan = function() {

    };
    sound.Sound.prototype.cancelTween = function() {
        if (this.tween) {
            this.tween.cancel();
            this.tween = null;
        }
    };

}());



(function() {
    var sound = bloom.ns('sound'),
        dom = bloom.ns('utilities.dom');

    sound.SoundMixer = function(options) {
        bloom.EventDispatcher.call(this);
        this.store = null;
        this.sounds = [];
        this.soundsById = {};
        this.playing = false;
    };

    bloom.inherits(sound.SoundMixer, bloom.EventDispatcher);

    bloom.prototype(sound.SoundMixer, {
        volume: 1,
        bindToStore: function(store) {
            if (!(store instanceof sound.SoundStore)) {
                throw new Error('Given store is not a sound.SoundStore');
            }
            this.store = store;
        },
        add: function(id) {
            var sound = this.store.get(id);
            sound.setLoop(true);
            this.sounds.push(sound);
            this.soundsById[id] = id;
            if (this.playing) {
                sound.play();
            }
        },
        has: function(id) {
            return this.soundsById.hasOwnProperty(id);
        },
        remove: function(id) {
            if (!this.soundsById.hasOwnProperty(id)) {
                return;
            }
            var i = 0, ss = this.sounds, l = ss.length, sound;
            for (i = 0; i < l; i += 1) {
                if (ss[i].id === id) {
                    sound = ss[i];
                    break;
                }
            }

            if (sound) {
                this.store.release(id, sound);
                sound.stop();
                ss.splice(i, 1);
            }
            delete this.soundsById[id];
        },
        apply: function(method) {
            var i = 0, ss = this.sounds, l = ss.length;
            for (i = 0; i < l; i += 1) {
                ss[i][method]();
            }
        },
        play: function() {
            if (!this.playing) {
                this.playing = true;
                this.apply('play');
            }
        },
        stop: function() {
            this.playing = false;
            this.apply('stop');
        },
        pause: function() {
            this.playing = false;
            this.apply('pause');
        },
        fadeIn: function() {
            this.play();
            //this.apply('fadeIn');
        },
        fadeOut: function() {
            this.stop();
            //this.apply('fadeOut');
        },
        rewind: function() {
            this.apply('rewind');
        },
        setVolume: function(volume) {
            this.volume = volume;
        },
        getVolume: function() {
            return this.volume;
        },
        panTo: function() {

        },
        invertPan: function() {
            this.apply('invertPan');
        },
        // TO BE USED AS COMPONENT
        start: function() {
            this.fadeIn();
        },
        end: function() {
            this.fadeOut();
        },
    });

}());



(function() {
    var sound = bloom.ns('sound'),
        utilities = bloom.ns('utilities'),
        file = bloom.ns('utilities.file'),
        string = bloom.ns('utilities.string');

    sound.SoundStore = function(options) {
        this.manifest = null;
        this.pools = {};
        if (!!options && options.hasOwnProperty('manifest')) {
            this.manifest = options.manifest;
            this.importFromManifest();
        }
    };

    bloom.prototype(sound.SoundStore, {
        importFromManifest: function() {
            if (!this.manifest) {
                return;
            }
            var sounds = this.manifest.getByType(file.SOUND), i, l = sounds.length;
            for (i = 0; i < l; i += 1) {
                if (!!sounds[i].id) {
                    this.register(sounds[i].id, sounds[i]);
                }
            }
        },
        register: function(id, options) {
            var ps = this.pools;
            // IFDEF DEBUG
            if (ps.hasOwnProperty(id)) {
                throw new Error(string.format('bloom: Sound.register: sound "{0}" already registered', id));
            }
            // /IFDEF DEBUG
            ps[id] = {
                pool: new utilities.Pool(sound.Sound),
                options: options
            };
        },
        get: function(id) {
            var ps = this.pools;
            if (!ps.hasOwnProperty(id)) {
                throw new Error(string.format('bloom: Sound.get: No sound found with id "{0}"', id));
            }
            return ps[id].pool.get(ps[id].options);
        },
        release: function(id, sound) {
            var ps = this.pools;
            if (!ps.hasOwnProperty(id)) {
                throw new Error(string.format('bloom: Sound.release: No sound found with id "{0}"', id));
            }
            ps[id].pool.release(sound);
        },
        once: function(id) {
            var s = this.get(id);
            console.log(s);
            s.play();
        }
    });

}());

/*global bloom*/
(function () {
    'use strict';

    var easing = bloom.ns('tween.easing');

    easing.Linear = {
        None: function (k) {
            return k;
        }
    };
    easing.Quadratic = {
        In: function (k) {
            return k * k;
        },
        Out: function (k) {
            return k * (2 - k);
        },
        InOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k;
            }
            return -0.5 * ((k -= 1) * (k - 2) - 1);
        }
    };
    easing.Cubic = {
        In: function (k) {
            return k * k * k;
        },
        Out: function (k) {
            return (k -= 1) * k * k + 1;
        },
        InOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k;
            }
            return 0.5 * ((k -= 2) * k * k + 2);
        }
    };
    easing.Quartic = {
        In: function (k) {
            return k * k * k * k;
        },
        Out: function (k) {
            return 1 - ((k -= 1) * k * k * k);
        },
        InOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k;
            }
            return -0.5 * ((k -= 2) * k * k * k - 2);
        }
    };
    easing.Quintic = {
        In: function (k) {
            return k * k * k * k * k;
        },
        Out: function (k) {
            return (k -= 1) * k * k * k * k + 1;
        },
        InOut: function (k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k * k;
            }
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        }
    };
    easing.Sinusoidal = {
        In: function (k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out: function (k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut: function (k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }
    };
    easing.Exponential = {
        In: function (k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function (k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function (k) {
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if ((k *= 2) < 1) {
                return 0.5 * Math.pow(1024, k - 1);
            }
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        }
    };
    easing.Circular = {
        In: function (k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function (k) {
            return Math.sqrt(1 - ((k -= 1) * k));
        },
        InOut: function (k) {
            if ((k *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - k * k) - 1);
            }
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        }
    };
    easing.Elastic = {
        In: function (k) {
            var s,
                a = 0.1,
                p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        },
        Out: function (k) {
            var s,
                a = 0.1,
                p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
        },
        InOut: function (k) {
            var s,
                a = 0.1,
                p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            if ((k *= 2) < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            }
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
        }
    };
    easing.Back = {
        In: function (k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out: function (k) {
            var s = 1.70158;
            return (k -= 1) * k * ((s + 1) * k + s) + 1;
        },
        InOut: function (k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s));
            }
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
    };
    easing.Bounce = {
        In: function (k) {
            return 1 - easing.Bounce.Out(1 - k);
        },
        Out: function (k) {
            if (k < (1 / 2.75)) {
                return 7.5625 * k * k;
            } else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }
        },
        InOut: function (k) {
            if (k < 0.5) {
                return easing.Bounce.In(k * 2) * 0.5;
            }
            return easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        }
    };

}());
/*global bloom*/
(function () {
    'use strict';

    var interpolation = bloom.ns('tween.interpolation');


    interpolation.Linear = function (v, k) {
        var m = v.length - 1,
            f = m * k,
            i = Math.floor(f),
            fn = interpolation.Utils.Linear;
        if (k < 0) {
            return fn(v[0], v[1], f);
        }
        if (k > 1) {
            return fn(v[m], v[m - 1], m - f);
        }
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    };

    interpolation.Bezier = function (v, k) {
        var b = 0,
            n = v.length - 1,
            pw = Math.pow,
            bn = interpolation.Utils.Bernstein,
            i;

        for (i = 0; i <= n; i += 1) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
    };
    interpolation.CatmullRom = function (v, k) {
        var m = v.length - 1,
            f = m * k,
            i = Math.floor(f),
            fn = interpolation.Utils.CatmullRom;

        if (v[0] === v[m]) {
            if (k < 0) {
                i = Math.floor(f = m * (1 + k));
            }
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        } else {
            if (k < 0) {
                return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            }
            if (k > 1) {
                return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }
            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    };
    interpolation.Utils = {
        Linear: function (p0, p1, t) {
            return (p1 - p0) * t + p0;
        },
        Bernstein: function (n, i) {
            var fc = interpolation.Utils.Factorial;
            return fc(n) / fc(i) / fc(n - i);
        },
        Factorial: (function () {
            var a = [1];
            return function (n) {
                var s = 1,
                    i;

                if (a[n]) {
                    return a[n];
                }
                for (i = n; i > 1; i -= 1) {
                    s *= i;
                }
                a[n] = s;
                return s;
            };
        }()),
        CatmullRom: function (p0, p1, p2, p3, t) {
            var v0 = (p2 - p0) * 0.5,
                v1 = (p3 - p1) * 0.5,
                t2 = t * t,
                t3 = t * t2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        }
    };

}());
/*global bloom*/
(function () {
    'use strict';

    var tween = bloom.ns('tween'),
        easing = bloom.ns('tween.easing'),
        interpolation = bloom.ns('tween.interpolation'),
        core = bloom.ns('core');

    tween.Tween = function (opts) {
        if (!!opts) {
            this.init(opts);
        }
    };

    tween.Tween.prototype.delay = 0;
    tween.Tween.prototype.elapsed = 0;
    tween.Tween.prototype.duration = 1000;
    tween.Tween.prototype.onEnd = null;
    tween.Tween.prototype.onUpdate = null;
    tween.Tween.prototype.init = function (opts) {
        if (opts.hasOwnProperty('delay') && opts.delay !== undefined) {
            this.delay = opts.delay;
        } else {
            this.delay = 0;
        }
        if (opts.hasOwnProperty('duration') && opts.duration !== undefined) {
            this.duration = opts.duration;
        } else {
            this.duration = 1000;
        }
        if (opts.hasOwnProperty('easing') && opts.easing !== undefined) {
            this.easing = opts.easing;
        } else {
            this.easing = easing.Linear.None;
        }
        if (opts.hasOwnProperty('interpolation') && opts.interpolation !== undefined) {
            this.interpolation = opts.interpolation;
        } else {
            this.interpolation = interpolation.Linear;
        }
        if (opts.hasOwnProperty('onUpdate') && opts.onUpdate !== undefined) {
            this.onUpdate = opts.onUpdate;
        } else {
            this.onUpdate = null;
        }
        if (opts.hasOwnProperty('onEnd') && opts.onEnd !== undefined) {
            this.onEnd = opts.onEnd;
        } else {
            this.onEnd = null;
        }

        if (opts.hasOwnProperty('startValues') && opts.startValues !== undefined) {
            this.startValues = opts.startValues;
        } else if (opts.hasOwnProperty('from') && opts.from !== undefined) {
            this.startValues = opts.from;
        } else {
            this.startValues = {};
        }

        if (opts.hasOwnProperty('endValues') && opts.endValues !== undefined) {
            this.endValues = opts.endValues;
        } else if (opts.hasOwnProperty('to') && opts.to !== undefined) {
            this.endValues = opts.to;
        } else {
            this.endValues = {};
        }

        this.elapsed = 0;
        this.result = {};
        this.update(0, 0, true);
    };

    tween.Tween.prototype.update = function (time, delta, force) {
        var starters = this.startValues,
            enders = this.endValues,
            object = this.result,
            elapsed = this.elapsed,
            duration = this.duration,
            delay = this.delay,
            ended = false,
            start,
            end,
            value,
            property,
            cb = this.onUpdate;

        if (!force && this.delay > 0) {
            this.delay -= delta;
            if (this.delay > 0) {
                return true;
            }
        }

        elapsed += delta;
        if (elapsed >= duration) {
            elapsed = duration;
            ended = true;
        }
        this.elapsed = elapsed;

        value = this.easing(elapsed / this.duration);
        for (property in starters) {
            if (starters.hasOwnProperty(property)) {
                start = starters[property];
                end = enders[property];
                object[property] = start + (end - start) * value;
            }
        }

        if (typeof cb === 'function') {
            cb(object, elapsed, ended);
        }

        if (ended) {
            cb = this.onEnd;
            if (typeof cb === 'function') {
                cb(object, elapsed);
            }

            return false;
        }

        return true;
    };


}());
/*global bloom*/
(function () {
    'use strict';

    var tween = bloom.ns('tween'),
        utilities = bloom.ns('utilities'),
        core = bloom.ns('core');

    tween.Tweener = function () {
        this.tweens = [];
        this.pool = new utilities.Pool(tween.Tween);
    };

    tween.Tweener.prototype.add = function (tween) {
        this.tweens.push(tween);
    };
    tween.Tweener.prototype.remove = function (tween) {
        this.removeByIndex(this.tweens.indexOf(tween));
    };
    tween.Tweener.prototype.removeByIndex = function (index) {
        this.tweens.splice(index, 1);
    };
    tween.Tweener.prototype.update = function (time, delta) {
        var ts = this.tweens, l;
        for (l = this.tweens.length - 1; l >= 0; l -= 1) {
            if (!ts[l].update(time, delta)) {
                this.removeByIndex(l);
            }
        }
    };

    tween.tweener = new tween.Tweener();

    tween.tween = function (from, to, duration, cb, easing, delay, onEnd) {
        var tt = tween.tweener,
            p = tt.pool,
            t = p.get();

        t.init({
            startValues: from,
            endValues: to,
            duration: duration,
            delay: delay,
            easing: easing,
            onUpdate: cb,
            onEnd: function () {
                if (typeof onEnd === 'function') {
                    onEnd(t);
                }
                p.release(t);
            }
        });

        tt.add(t);
    };

}());
(function () {
    var array = bloom.ns('utilities.array');

    array.apply = function(arr, fName) {
        var i, l = arr.length, o;
        for (i = 0; i < l; i += 1) {
            o = arr[i][fName];
            if (typeof o === 'function') {
                o.apply(arr[i]);
            };
        }
    };

}());

(function() {

    var bitmap = bloom.ns('bloom.utilities.bitmap'),
        dom = bloom.ns('bloom.utilities.dom');

    bitmap.heightmap = function(img) {
        var canvas = dom.create('canvas'),
            context,
            size,
            data,
            i,
            imgd,
            pix,
            j;

        canvas.width = img.width;
        canvas.height = img.height;
        context = canvas.getContext('2d');

        size = img.width * img.height;
        data = new Float32Array(size);
        context.drawImage(img,0,0);
        for (i = 0; i < size; i += 1) {
            data[i] = 0
        }

        imgd = context.getImageData(0, 0, img.width, img.height);
        pix = imgd.data;

        j = 0;
        for (i = 0; i < pix.length; i += 4, j += 1) {
            data[j] = (pix[i] + pix [i + 1] + pix[i + 2]) / (255 * 3);
        }

        return data;
    };
}());

(function () {
    var dom = bloom.ns('utilities.dom'),
        string = bloom.ns('utilities.string'),
        d = document,
        b = d.body;


    dom.all = function(selector, el) {
        return (el || b).querySelectorAll(selector);
    };

    dom.html = function(selector, html) {
        dom.get(selector).innerHTML = html;
    };

    dom.absolute = function(element, rootId) {
        var r = {
            top: 0,
            left: 0
        };
        if (element.offsetParent) {
            do {
                r.top += element.offsetTop;
                r.left += element.offsetLeft;
                element = element.offsetParent;
            } while (element && (!rootId ||element.getAttribute('id') !== rootId));
        }
        return r;
    };

}());

(function () {
    var math = bloom.ns('utilities.math');

    /**
     * Return the sum of all numbers in given array. Assumes that given array
     * is actually an array of numbers (no type check).
     *
     * @memberOf bloom.utilities.math
     * @param  {Array} a An array of numbers
     * @return {Number}   The sum of all numbers in given array
     */
    math.sum = function(a) {
        var s = 0, i, l = a.length;
        for (i = 0; i < l; i += 1) {
            s += a[i];
        }
        return s;
    };

    /**
     * Normalize all numbers in given array and return a new array
     * (divide all numbers by the maximum value found in array).
     *
     * @param  {Array} a An array of numbers
     * @return {Array}   A new array with normalized numbers
     */
    math.normalize = function(a) {
        var max = Math.max.apply(null, a),
            i,
            l = a.length,
            r = [];
        for (i = 0; i < l; i += 1) {
            r[i] = a[i] / max;
        }
        return r;
    };


  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    math.round = function(value, exp) {
        return decimalAdjust('round', value, exp);
    };

    math.floor = function(value, exp) {
        return decimalAdjust('floor', value, exp);
    };

    math.ceil = function(value, exp) {
        return decimalAdjust('ceil', value, exp);
    };

    math.random = function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };
    math.clamp = function(v, min, max) {
        return Math.min(Math.max(v, min), max);
    };
}());

(function () {
    var string = bloom.ns('utilities.string'),

        urlizeAcc = 'Þßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕ',
        urlizeNoAcc = 'bsaaaaaaaceeeeiiiidnoooooouuuyybyr',

        uidIdx = -1;

    string.uid = function(str) {
        uidIdx += 1;
        return 'e' + uidIdx;
    };
    string.format = function(str) {
        var a = Array.prototype.slice.call(arguments, 1);
        return str.replace(/{(\d+)}/g, function(match, number) {
            return typeof a[number] != 'undefined' ? a[number] : match;
        });
    };

    string.capitalize = function(str) {
        if (!str) {
            return str;
        }
        return str[0].toUpperCase() + str.slice(1);
    };

    string.urlize = function(str, char) {
            var str = str.toLowerCase().split(''),
                s = [],
                l = str.length,
                y = 0,
                i = -1 ;

            for ( y; y < l; y+= 1) {
                if (( i = urlizeAcc.indexOf(str[y]) ) > -1) {
                  s[y] = urlizeNoAcc[i];
                } else {
                  s[y] = str[y];
                }
            }

            return s.join('').trim().replace(/[^a-z0-9\-]/g,' ').split(' ').join('-').replace(/[\-]{1,}/g, char || '-');
    };

    string.toBase64 = function(str) {
        return window.btoa(escape(encodeURIComponent(str)));
    };
    string.fromBase64 = function(str) {
        return decodeURIComponent(unescape(window.atob(str)));
    };

    string.pad = function(num, size) {
        var s = String() + num;
        while (s.length < size) {
            s = '0' + s;
        }
        return s;
    };

    string.prettify = function (num, separator) {
        var s = num.toString().split('.'),
            left = s[0],
            right = !!s[1] ? '.' + s[1] : '',
            i = 0,
            l = left.length - 1,
            r = '';
        while (l > -1) {
            r = left[l] + r;
            i += 1;
            if (i === 3) {
                r = ' ' + r;
                i = 0;
            }
            l -= 1;
        }
        r = r.trim() + right;
        if (typeof separator === 'string') {
            r = r.replace(' ', separator);
        }
        return r;
    };
}());



(function() {
    var components = bloom.ns('core.components'),
        core = bloom.ns('core');

    components.CanvasComponent = function() {
        core.Component.call(this);
    };
    bloom.inherits(components.CanvasComponent, core.Component);

    components.CanvasComponent.prototype.requireRedraw = function() {
        var a = this.actor, l;
        if (!a) {
            return;
        }
        l = a.layer;
        if (!l) {
            return;
        }
        l.requireRedraw(this);
    };

    components.CanvasComponent.prototype.clear = function(x, y, w, h) {
        var l;
        if (this.actor) {
            l = this.actor.layer;
            l.clear.apply(l, arguments);
        }
    };
}());

(function() {
    'use strict';
    var core = bloom.require('core'),
        components = bloom.ns('core.components');

    core.Component2D = function (opts) {
        core.Component.apply(this, arguments);
        this.x = opts && opts.hasOwnProperty('x') ? opts.x : 0;
        this.y = opts && opts.hasOwnProperty('y') ? opts.y : 0;
        this.width = opts && opts.hasOwnProperty('width') ? opts.width : 10;
        this.height = opts && opts.hasOwnProperty('height') ? opts.height : 10;
        this.rotation = opts && opts.hasOwnProperty('rotation') ? opts.rotation : 0;
    }

    bloom.inherits(core.Component2D, core.Component);


    core.Component2D.prototype.intersect = function(bb) {
        return this.x < bb.x + bb.width && this.x + this.width > bb.x &&
            this.y < bb.y + bb.height && this.y + this.height > bb.y;
    };


    core.Component2D.prototype.overlap = function(bb) {
        if (this.x > bb.x && this.x < bb.x + bb.width &&
            this.y > bb.y && this.y < bb.y + bb.height) {
            return true;
        }
        return false;
    };


    core.Component2D.prototype.toString = function() {
        return this.nw.x + ',' + this.nw.y + ';' + this.se.x + ',' + this.se.y;
    };
}());
(function() {
    'use strict';
    var core = bloom.require('core'),
        components = bloom.ns('core.components');

    core.Motion2D = function (opts) {
        core.Component.apply(this, arguments);
        this.vx = opts && opts.hasOwnProperty('vx') ? opts.vx : 0;
        this.vy = opts && opts.hasOwnProperty('vy') ? opts.vy : 0;

        this.xmin = opts && opts.hasOwnProperty('xmin') ? opts.xmin : Number.NEGATIVE_INFINITY;
        this.xmax = opts && opts.hasOwnProperty('xmax') ? opts.xmax : Number.POSITIVE_INFINITY;
        this.ymin = opts && opts.hasOwnProperty('ymin') ? opts.ymin : Number.NEGATIVE_INFINITY;
        this.ymax = opts && opts.hasOwnProperty('ymax') ? opts.ymax : Number.POSITIVE_INFINITY;
    }

    bloom.inherits(core.Motion2D, core.Component);

    core.Motion2D.prototype.update = function () {

        if (this.vx < this.xmin) { this.vx = this.xmin; }
        if (this.vx > this.xmax) { this.vx = this.xmax; }
        if (this.vy < this.ymin) { this.vy = this.ymin; }
        if (this.vy > this.ymax) { this.vy = this.ymax; }
        var c2d = this.get(core.Component2D);

        if (c2d === null) {
            return;
        }

        c2d.x += this.vx;
        c2d.y += this.vy;
    }

}());
(function() {
    'use strict';
    var core = bloom.require('core'),
        components = bloom.ns('core.components');

    core.BoundingBox2DDisplay = function () {
        components.CanvasComponent.apply(this, arguments);

        this.mx = 0;
        this.w = 100;

    }

    bloom.inherits(core.BoundingBox2DDisplay, components.CanvasComponent);

    core.BoundingBox2DDisplay.prototype.update = function() {
        this.requireRedraw();
    };
    core.BoundingBox2DDisplay.prototype.draw = function(context) {
        var bb = this.actor.getComponent(core.Component2D),
            a = this.actor;

        if (!bb) {
            return;
        }

        context.fillStyle = "rgba(20, 240, 20, 0.5)";
        context.fillRect(bb.x, bb.y, bb.width, bb.height);
    };
}());


(function() {
    var components = bloom.ns('core.components'),
        dom = bloom.ns('utilities.dom'),
        string = bloom.ns('utilities.string');

    components.HTMLContent = function(options) {
        this.template = null;
        this.html = 'No template given';

        if (!!options && options.hasOwnProperty('template')) {
            this.template = options.template;
            var t = dom.get('#tpl-' + this.template);
            if (!t) {
                this.html = string.format('Template "{0}" not found', this.template);
            } else {
                this.html = t.textContent;
            }
        }
    };

}());



(function() {
    var components = bloom.ns('core.components'),
        core = bloom.ns('core'),
        dom = bloom.ns('utilities.dom'),
        binding = bloom.ns('binding'),
        string = bloom.ns('utilities.string');

    components.HTMLTemplate = function(options) {
        core.Component.call(this);
        this.template = null;
        this.context = null;
        this.html = null;

        if (!!options) {
            if (options.hasOwnProperty('template')) {
                this.template = options.template;
                var t = dom.get('#tpl-' + this.template);
                if (!t) {
                    this.html = string.format('Template "{0}" not found', this.template);
                } else {
                    this.html = t.textContent;
                }
            }
            if (options.hasOwnProperty('context')) {
                this.context = options.context;
            }
        }
    };

    bloom.inherits(components.HTMLTemplate, core.Component);

    components.HTMLTemplate.prototype.start = function() {
    };

    components.HTMLTemplate.prototype.end = function() {
    };

}());



(function() {
    var components = bloom.ns('core.components'),
        keyboard = bloom.ns('input.keyboard'),
        dom = bloom.ns('utilities.dom');

    components.TextInputComponent = function(options) {
        bloom.EventDispatcher.call(this);
    };

    bloom.inherits(components.TextInputComponent, bloom.EventDispatcher);

    components.TextInputComponent.prototype.text = '';
    components.TextInputComponent.prototype.getText = function() {
        return this.text;
    };

    components.TextInputComponent.prototype.start = function() {
        keyboard.on('keyup', this);
    };

    components.TextInputComponent.prototype.keyToString = function(key) {
        if (key === keyboard.SPACE) {
            return ' ';
        }
        if (key.length === 1) {
            return key;
        }
        return null;
    };
    components.TextInputComponent.prototype.keyupHandler = function(e) {
        var key = e.key,
            t = this.text;

        if (key === keyboard.ENTER && !!this.text) {
            this.dispatch({
                type: 'submit',
                text: this.text
            });

            this.text = '';
            return;
        }

        if (key === keyboard.BACKSPACE) {
            t = t.slice(0, -1);
        } else {
            key = this.keyToString(key);
            if (!!key) {
                t += key;
            }
        }

        if (t !== this.text) {
            this.text = t;
            this.dispatch({
                type: 'input',
                text: this.text
            });
        }
    };


    components.TextInputComponent.prototype.end = function() {
        keyboard.off('keyup', this);
    };
}());



(function() {
    var core = bloom.ns('core'),
        colors = bloom.ns('game.colors'),
        dom = bloom.require('utilities.dom');

    core.Layer2D = function(opts) {
        core.Layer.call(this, opts);
        this.template = null;
        this.autoclear = opts && opts.hasOwnProperty('autoclear') ? opts.autoclear : false;
        this.w = opts && opts.hasOwnProperty('width') ? opts.width : 800;
        this.h = opts && opts.hasOwnProperty('height') ? opts.height : 450;
        this.classname = opts && opts.hasOwnProperty('classname') ? opts.classname : '';
        this.element = dom.create('canvas', {
            width: this.w,
            height: this.h,
            class: 'layer-2d ' + this.classname
        });
        if (!!this.id) {
            this.element.setAttribute('id', this.id);
        }
        this.requiredRedraw = [];
        this.clearColor = opts && opts.hasOwnProperty('clearColor') ? opts.clearColor : null;
    };

    bloom.inherits(core.Layer2D, core.Layer);

    core.Layer2D.prototype.start = function() {
        dom.get('#wrapper').appendChild(this.element);
    };

    core.Layer2D.prototype.update = function(time, delta) {
        var i = 0, l, c;

        core.Layer.prototype.update.apply(this, arguments);

        l = this.requiredRedraw.length;

        if (l) {
            this.clear();

            c = this.getContext();
            for (i = 0; i < l; i += 1) {
                this.requiredRedraw[i].draw(c, time, delta);
            }
            this.requiredRedraw.length = 0;
        }
    };

    core.Layer2D.prototype.clear = function(x, y, w, h) {
        if (arguments.length === 0) {
            x = 0;
            y = 0;
            w = this.w;
            h = this.h;
        }
        var c = this.getContext();
        if (!!this.clearColor) {
            c.fillStyle = this.clearColor;
            c.fillRect(x, y, w, h);
        } else {
            c.clearRect(x, y, w, h);
        }
    };

    core.Layer2D.prototype.end = function() {
        var w = dom.get('#wrapper'),
            e = this.element;
        if (w.contains(e)) {
            w.removeChild(e);
        }
    };

    core.Layer2D.prototype.requireRedraw = function(component) {
        if (!!component && this.requiredRedraw.indexOf(component) === -1) {
            this.requiredRedraw.push(component);
        }
    };

    core.Layer2D.prototype.getCanvas = function() {
        return this.element;
    };

    core.Layer2D.prototype.getContext = function() {
        return this.element.getContext('2d');
    };

    core.Layer2D.prototype.attachComponent = function(component) {
        if (typeof component.draw === 'function') {
            component.draw(this.getContext());
        }
    };

    core.Layer2D.prototype.detachComponent = function(component) {
        if (typeof component.clear === 'function') {
            component.clear(this.getContext());
        }
    };
}());



(function() {
    var core = bloom.ns('core'),
        dom = bloom.require('utilities.dom');

    core.Layer3D = function() {
        core.Layer.call(this);

    };

    bloom.inherits(core.Layer3D, core.Layer);
    bloom.prototype(core.Layer3D, {
        start: function() {

        },
        end: function() {

        }
    });

}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.ns('core'),
        string = bloom.ns('utilities.string'),
        dom = bloom.ns('utilities.dom');

    core.LayerHTML = function (opts) {
        core.Layer.call(this, arguments);
        this.template = null;
        this.classname = null;
        if (!!opts) {
            if (typeof opts.template === 'string') {
                this.template = opts.template;
            }
            if (typeof opts.classname === 'string') {
                this.classname = opts.classname;
            }
        }
        this.element = dom.create(typeof opts.element === 'string' ?
                                        opts.element : 'div');
        if (typeof opts.id === 'string') {
            this.element.setAttribute('id', opts.id);
        }
    };

    bloom.inherits(core.LayerHTML, core.Layer);

    core.LayerHTML.prototype.start = function () {
        this.element.setAttribute('class', 'layer-html ' + (this.classname || '') + ' ' + this.scene.id);
        dom.get('#wrapper').appendChild(this.element);
        if (!!this.template) {
            var t = dom.get('#tpl-' + this.template);
            if (!t) {
                throw new Error(string.format('Template "{0}" not found', this.template));
            }
            this.element.innerHTML = t.innerHTML;
        }
    };

    core.LayerHTML.prototype.end = function () {
        var wrapper = dom.get('#wrapper');
        if (wrapper.contains(this.element)) {
            wrapper.removeChild(this.element);
        }
        this.element.innerHTML = '';
    };
    core.LayerHTML.prototype.attachComponent = function (component) {
        if (component.hasOwnProperty('html')) {
            this.element.innerHTML = component.html;
        }
    };
    core.LayerHTML.prototype.detachComponent = function (component) {
        if (component.hasOwnProperty('html')) {
            this.element.innerHTML = '';
        }
    };


}());

/*global bloom*/
(function () {
    'use strict';
    var core = bloom.require('core'),
        game = bloom.require('game');

    game.CreditsScene = function () {
        core.Scene.call(this);
        this.id = 'credits';
    };

    bloom.inherits(game.CreditsScene, core.Scene);

    game.CreditsScene.prototype.start = function () {
        this.layer = new core.LayerHTML({
            template: 'credits'
        });
    };
}());

/*global bloom*/


(function () {
    'use strict';

    var core = bloom.require('core'),
        components = bloom.require('core.components'),
        dom = bloom.require('utilities.dom'),
        string = bloom.require('utilities.string'),
        math = bloom.require('utilities.math'),


        levelProgressMultiplier = 1.2,

        levelPoints = {
            click: 1,
            hire: 20,
            improvement: 50
        },

        firstLevelXp = 1000,

        temperatureYearsLag = 30,

        tonByPPM = 2130000000,
        tonTreeAbsorptionPerYear = 0.0217728,

        startYear = 2017,

        game = bloom.require('game'),
        definitions = bloom.ns('game.definitions');

    game.EarthActor = function () {
        core.Entity.apply(this, arguments);
        this.time = 0;
    };

    bloom.inherits(game.EarthActor, core.Entity);

    game.EarthActor.prototype.getCurrentAbsorptionPerYear = function () {
        return this.getCurrentAbsorptionPerWeek() * 52 / tonByPPM;
    };
    game.EarthActor.prototype.getCurrentEmissionsPerYear = function () {
        return this.state.get('ppmIncrement') * this.getImprMultiplier('ppmPerYearMultiplier');
    };
    game.EarthActor.prototype.getCurrentEmissionsTonsPerWeek = function () {
        return this.state.get('ppmIncrement') * tonByPPM * this.getImprMultiplier('ppmPerYearMultiplier') / 52;
    };
    game.EarthActor.prototype.getCurrentCO2InTons = function () {
        return this.state.get('ppm') * tonByPPM - this.state.get('absorbed');
    };
    game.EarthActor.prototype.getTreeAbsorptionPerWeek = function () {
        return tonTreeAbsorptionPerYear / 52;
    };
    game.EarthActor.prototype.getAbsorptionAndGrowthMutiplier = function () {
        var ppm = this.state.get('ppm'),
            tpAnomaly = (this.state.get('tp') - 14) + 1;

        return ppm <= 230 ? Math.max((ppm - 180) / 50 - 0.1, 0) : 1;
    };
    game.EarthActor.prototype.getCurrentAbsorptionPerWeek = function () {
        return this.getTreeAbsorptionPerWeek() * this.state.get('trees') * this.getAbsorptionAndGrowthMutiplier();
    };
    game.EarthActor.prototype.getActualPPMPerYear = function () {
        return this.getCurrentEmissionsPerYear() - this.getCurrentAbsorptionPerYear();
    };
    game.EarthActor.prototype.start = function () {
        var s = this.state,
            i = 0,
            a,
            l,
            t,
            yearlyPpm;

        // State initialization
        if (!s.has('trees')) {
            s.set('initing', 1);
            s.set('over', 0);
            s.set('trees', 0);
            s.set('growing', []);
            s.set('gold', 0);
            s.set('levelProgress', 0);
            s.set('level', 0);
            s.set('clicks', 0);
            s.set('hires', 0);
            s.set('hiresMax', 0);
            s.set('hiresActual', 0);
            s.set('totalGold', 0);
            s.set('totalTrees', 0);
            s.set('achievements', []);
            s.set('improvements', []);
            s.set('month', 1);
            s.set('year', startYear);
            s.set('ppm', 401);
            s.set('ppmIncrement', 2.1);
            s.set('absorbed', 0);
            

            yearlyPpm = [];
            for (i = 0, t = s.get('ppm'); i < temperatureYearsLag; i += 1, t -= s.get('ppmIncrement')) {
                yearlyPpm.unshift(Math.round(t));
            }
            s.set('yearlyTemperatureDiff', 0.1);
            s.set('yearlyPpm', yearlyPpm);
            s.set('tp', 14 + (yearlyPpm[1] - 280) * 3 / 280);
            s.set('lastTp', 14 + (yearlyPpm[0] - 280) * 3 / 280);
        }
        a = s.get('growing');
        l = a.length;
        while(l < 52) {
            a.push(0);
            l += 1;
        }

        this.screen = new game.ScreenComponent();
        this.landscape = new game.LandscapeComponent();
        this.news = new game.NewsGeneratorComponent();

        this.add(this.screen);
        this.add(this.landscape);
        this.add(this.news);
        this.bannedWorkers = [];
        this.refreshBannedWorkers();
        this.hideInitialScreen();
        this.screen.displayNews('info', 'Welcome to <span>EcoClicker</span>!', 'Click the <span class="text-green">big green button</span> to start planting trees!');
        this.screen.refresh();
        this.screen.addButtons();
        this.displayInitialMessage();
        this.play();
    };



    game.EarthActor.prototype.checkAchievements = function () {
        var i,
            achievements = definitions.achievements,
            l = achievements.length,
            a,
            achieved = this.state.get('achievements'),
            foundAchievement = false;

        for (i = 0; i < l; i += 1) {
            a = achievements[i];
            if (achieved.indexOf(a.name) === -1 && this.state.get(a.key) >= a.value) {
                this.screen.displayAchievement(a);
                achieved.push(a.name);
                foundAchievement = true;
            }
        }
        if (foundAchievement) {
            this.screen.refresh();
        }
    };
    game.EarthActor.prototype.update = function (time, delta) {
        this.time += delta;
        var updateDelta = 1000;
        

        if (this.time >= updateDelta) {
            while (this.time >= updateDelta) {
                this.time -= updateDelta;
                this.refreshBannedWorkers();
                this.tick();
                this.checkLevel();
                this.checkAchievements();
                this.checkGameOver();
            }
            this.screen.refresh();
        } else {
            this.checkLevel();
            this.screen.refresh();
        }
        this.screen.refreshUI();
    };

    game.EarthActor.prototype.hideInitialScreen = function () {
        if (this.state.get('initing') === 0 || this.state.get('level') > 0) {
            return;
        }
        dom.get('.header-growing').style.display = 'none';
        dom.get('#increasePerTick').style.display = 'none';
        dom.get('.header-trees').style.display = 'none';
        dom.get('.header-gold').style.display = 'none';
        dom.get('.header-level').style.display = 'none';
        dom.get('.header-date').style.display = 'none';
        dom.get('#stats-container').style.display = 'none';
        dom.get('#chopTree').style.display = 'none';
        dom.get('#workers').style.display = 'none';
        dom.get('#workers-title').style.display = 'none';
        dom.get('#improvements').style.display = 'none';
        dom.get('#improvements-title').style.display = 'none';
        dom.get('#research-title').style.display = 'none';
        dom.get('#research').style.display = 'none';
    };
    game.EarthActor.prototype.displayInitialMessage = function () {
        var initing = this.state.get('initing'),
            trees = this.state.get('trees'),
            clicks = this.state.get('clicks');

        if (!initing) {
            return;
        }

        if (clicks === 1) {
            this.screen.displayNews('info', '<span>The journey begins</span>!',
                'You\'ve planted your first tree. You\'ll need a lot of trees. Plant another tree...');
            return;
        }

        if (clicks === 2) {
            this.screen.displayNews('info', '<span>The ultimate journey</span>!',
                'Trees can help a lot to save humanity. Plant another tree...');
            return;
        }

        if (clicks >= 3) {
            dom.get('.header-growing').style.display = 'block';
            if (clicks === 2) {
                this.screen.displayNews('info', '<span>This is a planting journey</span>!',
                    'The number of growing trees is visible at the top left of the screen. ' +
                    'Continue to plant trees...');
                return;
            }
        }

        if (clicks === 5) {
            this.screen.displayNews('info', '<span>Trees need time to grow</span>!',
                'Trees take one year to grow.');
            return;
        }

        if (clicks >= 10) {
            dom.get('.header-trees').style.display = 'block';
            if (clicks === 10) {
                this.screen.displayNews('info', '<span>Grown trees</span>!',
                    'The number of grown trees appear at the top center. Continue planting trees...');
                return;
            }
        }

        if (clicks >= 20) {
            dom.get('.header-date').style.display = 'block';
            if (clicks === 20) {
                this.screen.displayNews('info', '<span>Keep an eye on time</span>!',
                    'The current date is visible at the top right of the screen.');
                return;
            }
        }

        if (clicks >= 30) {
            dom.get('.header-level').style.display = 'block';
            if (clicks === 30) {
                this.screen.displayNews('info', '<span>Get experience</span>!',
                    'Each time you plant a tree, or use other actions, you gain experience. '+
                    'Experience progress is visible at the top right of the screen.');
                return;
            }
        }

        if (clicks === 40) {
            this.screen.displayNews('info', '<span>Your mission: save the world [1/2]</span>!',
                'Now that you\'re growing a forest, you need to save the world.');
            return;
        }

        if (clicks >= 50) {
            dom.get('#stats-container').style.display = 'block';
            if (clicks === 50) {
                this.screen.displayNews('info', '<span>Your mission: save the world [2/2]</span>!',
                    'It\'s quite simple: keep the temperature anomaly between -6°C and +3.5°C. Otherwise, it\'s the end of Humanity - it\'s game over.');
                return;
            }
        }

        if (clicks >= 60) {
            dom.get('.header-gold').style.display = 'block';
            if (clicks === 60) {
                this.screen.displayNews('info', '<span>How to save the world</span>?',
                    'Now, we live in a capitalistic economy. You\'ll need money to save the world.');
                return;
            }
        }

        if (clicks >= 70) {
            dom.get('#chopTree').style.display = 'block';
            if (clicks === 70) {
                this.screen.displayNews('info', '<span>Get gold</span>!',
                    'To get gold, just click the big yellow button once some trees are grown, to chop them down and sell them for gold.');
                return;
            }
        }

        if (clicks >= 80) {
            dom.get('#increasePerTick').style.display = 'inline-block';
            dom.get('#workers').style.display = 'block';
            dom.get('#workers-title').style.display = 'block';
            if (clicks === 80) {
                this.screen.displayNews('info', '<span>Hire workers</span>!',
                    'Once you have gold, you can hire workers, who will plant and chop trees for you.');
                return;
            }
        }

        if (clicks >= 90) {
            dom.get('#improvements').style.display = 'block';
            dom.get('#improvements-title').style.display = 'block';
            if (clicks === 90) {
                this.screen.displayNews('info', '<span>Adopt policies</span>!',
                    'You can also adopt policies, that will bring various kind of improvements.');
                return;
            }
        }
        if (clicks >= 100) {
            dom.get('#research').style.display = 'block';
            dom.get('#research-title').style.display = 'block';
            if (clicks === 100) {
                this.screen.displayNews('info', '<span>Science</span>!',
                    'At last, you can spend money on research, in order to improve your workers productivity, or even escape the game.');
                return;
            }
        }

        if (clicks >= 110) {
            if (clicks === 110) {
                this.screen.displayNews('info', '<span>Good luck</span>!',
                    'You\'re on your own now. Thank you for saving the world!');
            }
            this.state.set('initing', 0);
        }

    };
    game.EarthActor.prototype.checkLevel = function () {
        var s = this.state,
            lp = s.get('levelProgress'),
            max = this.getLevelMaxProgress();

        if (lp >= max) {
            s.decrement('levelProgress', max);
            s.increment('level');
            this.screen.displayNews('info', '<span>Level up</span>!',
                string.format('You reached level {0}. Way to go!', s.get('level')));
        }
    };

    game.EarthActor.prototype.tick = function () {
        var ws = definitions.workers,
            imprs = definitions.improvements,
            w,
            impr,
            i,
            l = ws.length,
            s = this.state,
            m = this.getImprMultiplier('workerLevelProgressPerTick'),
            nPlanted = 0,
            growing = s.get('growing'),
            y,
            yp,
            ppmYearsAgo,
            month,
            ppm,
            tpAnomaly,
            growMultiplier,
            plantMultiplier,
            chopMultiplier,
            yieldsMutiplier,
            num,
            total = 0,
            title,
            sentence;

        if (s.get('over')) {
            return;
        }

        ppm = s.increment('ppm', this.getActualPPMPerYear() / 52);
        growMultiplier = this.getAbsorptionAndGrowthMutiplier();

        s.increment('absorbed', this.getCurrentAbsorptionPerWeek());

        s.increment('month', 0.25);
        if (s.get('month') >= 13) {
            yp = s.get('yearlyPpm');
            yp.push(Math.max(0, Math.round(s.get('ppm'))));
            if (yp.length > temperatureYearsLag) {
                yp.splice(0, yp.length - temperatureYearsLag);
            }

            ppmYearsAgo = yp[0];
            tpAnomaly = (ppmYearsAgo - 280) * 3 / 280;
            if (tpAnomaly < -0.5) {
                tpAnomaly *= 10;
            }

            s.set('lastTp', s.get('tp'));
            s.set('tp', 14 + tpAnomaly);
            s.set('yearlyTemperatureDiff', Math.round((s.get('tp') - s.get('lastTp')) * 1000) / 1000);
            //console.log(s.get('tp'), s.get('tp') - s.get('lastTp'));

            s.set('month', 1);
            s.increment('year');

            if (this.getActualPPMPerYear() > 0) {
                title = 'Happy new year (sort of)';
                sentence = 'It\'s {0} now, and CO2 concentration is still increasing. We need more trees!!';
            } else if (this.getActualPPMPerYear() === 0) {
                title = 'Happy new year!';
                sentence = 'We\'re in {0}, and CO2 concentration is no more increasing. Continue the good work, we need to reduce CO2 concentration!';
            } else {
                title = 'Happy new year!';
                sentence = 'We\'re in {0}, and CO2 concentration is decreasing. Keep up the good work!';
            }
            this.screen.displayNews('info', '<span>' + title + '</span>!',
                string.format(sentence, s.get('year')));
        }

        if (s.get('month') >= 6 && s.get('month') <= 9 && ppm > 450 && Math.random() > 0.99) {
            this.dieOff();
        }

        plantMultiplier = this.getImprMultiplier('plant');
        chopMultiplier = this.getImprMultiplier('chop');
        yieldsMutiplier = this.getImprMultiplier('yieldsGold');

        // Workers trees, chop trees, gold
        for (i = 0; i < l; i += 1) {
            w = ws[i];
            num = s.get(w.name);
            total += num;
            if (num > 0 && !this.isWorkerBanned(w)) {
                y = w.yields * num * plantMultiplier * growMultiplier;
                if (y > 0) {
                    this.landscape.yields(y);
                    nPlanted += y;
                    // s.increment('trees', y);
                    // s.increment('totalTrees', y);
                }
                if (w.chop > 0) {
                    y = (w.chop || 0) * num * chopMultiplier;
                    if (s.get('trees') < y) {
                        y = s.get('trees');
                    }
                    if (y > 0) {
                        this.landscape.yields(y, 'price');
                        s.decrement('trees', y);
                        s.increment('gold', y);
                        s.increment('totalGold', y);
                    }
                }
                if (w.yieldsGold > 0) {
                    y = (w.yieldsGold || 0) * num * yieldsMutiplier;
                    if (y > 0) {
                        s.increment('gold', y);
                        s.increment('totalGold', y);
                    }
                }
            }
        }

        growing.push(nPlanted);
        y = growing.shift()* growMultiplier;
        s.increment('trees', y);
        s.increment('totalTrees', y);
        if (y >= 1) {
            this.landscape.drawTree();
        }

        // Improvements gold yield
        for (i = 0, l = imprs.length; i < l; i += 1) {
            impr = imprs[i];
            y = impr.yields;
            if (y > 0 && this.hasImprovement(impr.name)) {
                s.increment('gold', y);
                s.increment('totalGold', y);
            }
        }
        if (m > 1) {
            s.increment('levelProgress', (m - 1) * total);
        }
    };

    game.EarthActor.prototype.checkGameOver = function () {
        var s = this.state,
            tAnomaly = s.get('tp') - 14;

        // Temperature anomaly high, earth grilled
        if (tAnomaly > 3.50) {
            s.set('over', 1);
            this.layer.scene.gameOverHigh();
            return
        }

        if (tAnomaly < -6) {
            s.set('over', 1);
            this.layer.scene.gameOverLow();
            return
        }

        // Win!
        if (s.has('Eco dome')) {
            s.set('over', 1);
            this.layer.scene.win();
            return;
        }
    };

    game.EarthActor.prototype.chopTree = function (i) {
        var s = this.state;
        i = (typeof i === 'number' ? i : 1) * this.getImprMultiplier('clickChop');
        if (s.get('trees') >= i) {
            s.decrement('trees', i);
            s.increment('gold', i);
            s.increment('totalGold', i);
            s.increment('levelProgress', levelPoints.click * this.getImprMultiplier('levelProgressClick'));
            s.increment('clicks');
            this.landscape.yields(i, 'price');
            this.checkAchievements();
            this.screen.refresh();
            this.displayInitialMessage();
        }
    };
    game.EarthActor.prototype.plantTree = function (i) {
        var a,
            s = this.state;
        i = (typeof i === 'number' ? i : 1) * this.getImprMultiplier('clickPlant');

        this.landscape.yields(i);
        s.increment('levelProgress', levelPoints.click * this.getImprMultiplier('levelProgressClick'));
        s.increment('clicks');
        a = s.get('growing');
        a[a.length - 1] += i;
        this.checkAchievements();
        this.screen.refresh();
        this.displayInitialMessage();
    };

    game.EarthActor.prototype.dieOff = function () {
        var p = Math.random(),
            s = this.state,
            m = (1 - this.getImprMultiplier('resistance')) + 1;

        s.set('trees', Math.floor(s.get('trees') * (1 - (p * m))));
        this.screen.displayNews('news', '<span>Huge trees die-off</span>!',
            string.format('A lightning disease due to Global Warming killed a large number of trees. {0}% of your forest died.', Math.floor((p * m) * 100)));
    };

    game.EarthActor.prototype.buyImprovement = function (impr) {
        if (impr.type === 'research') {
            return this.buyResearch(impr);
        }
        var s = this.state,
            price = this.getImprPrice(impr);

        if (s.get('gold') >= price && s.get('improvements').indexOf(impr.name) === -1 && s.get('level') >= impr.level) {
            s.decrement('gold', price);
            s.get('improvements').push(impr.name);
            s.increment('improvementsNum', 1);
            s.increment('levelProgress', levelPoints.improvement);
            this.screen.refresh();
            this.checkAchievements();
        }
    };

    game.EarthActor.prototype.buyResearch = function (impr) {
        var s = this.state,
            price = this.getImprPrice(impr),
            tier = s.get(impr.name) || 0;

        if (s.get('gold') >= price && tier < impr.tiers && s.get('level') >= impr.level) {
            s.decrement('gold', price);
            s.set(impr.name, tier + 1);
            s.increment('improvementsNum', 1);
            s.increment('levelProgress', levelPoints.improvement);
            this.screen.refresh();
            this.checkAchievements();
        }
    };

    game.EarthActor.prototype.revokePolicy = function (impr) {
        // Cant revoke research
        if (impr.hasOwnProperty('type') && impr.type === 'research') {
            return;
        }

        var s = this.state,
            price = this.getImprSellPrice(impr),
            i = s.get('improvements').indexOf(impr.name);

        if (i > -1 && s.get('gold') >= price && s.get('level') >= impr.level) {
            s.decrement('gold', price);
            s.get('improvements').splice(i, 1);
            s.decrement('improvementsNum', 1);
            this.screen.refresh();
        }
    };
    game.EarthActor.prototype.hire = function (worker, num) {
        if (num > 1) {
            while (num > 0) {
                this.hire(worker),
                num -= 1;
            }
            return;
        }

        var s = this.state,
            current = s.get(worker.name, 0),
            price = this.getWorkerPrice(worker);

        if (s.get('gold') >= price && current < worker.max && s.get('level') >= worker.level) {
            s.decrement('gold', price);
            s.increment('hires', 1);
            s.increment('hiresActual', 1);
            s.increment(worker.name, 1);
            if (s.get('hiresActual') > s.get('hiresMax')) {
                s.set('hiresMax', s.get('hiresActual'));
                s.increment('levelProgress', levelPoints.hire * this.getImprMultiplier('levelProgressHire'));
            }
            this.screen.refresh();
            this.checkAchievements();
        }
    };
    game.EarthActor.prototype.sell = function (worker, num) {
        if (num > 1) {
            while (num > 0) {
                this.sell(worker),
                num -= 1;
            }
            return;
        }

        var s = this.state,
            current = s.get(worker.name, 0),
            price = this.getWorkerSellPrice(worker);

        if (current > 0 && s.get('level') >= worker.level) {
            s.increment('gold', price);
            s.decrement('hiresActual', 1);
            s.decrement(worker.name, 1);
            this.screen.refresh();
            this.checkAchievements();
        }
    };

    game.EarthActor.prototype.getIncreaseGoldPerTick = function () {
        var ws = definitions.workers,
            w,
            i,
            l = ws.length,
            s = this.state,
            total = 0,
            ac = s.get('improvements');

        for (i = 0; i < l; i += 1) {
            w = ws[i];
            if (!this.isWorkerBanned(w)) {
                total += (w.yieldsGold || 0) * s.get(w.name, 0) * this.getImprMultiplier('yieldsGold');
                total += (w.chop || 0) * s.get(w.name, 0) * this.getImprMultiplier('chop');
            }
        }
        for (i = 0, ws = definitions.improvements, l = ws.length; i < l; i += 1) {
            w = ws[i];
            if (ac.indexOf(w.name) > -1) {
                total += (w.yields || 0);
            }
        }
        if (total < 1000 && total > -1000) {
            return Math.floor(total * 10) / 10;
        }
        return Math.floor(total);
    };
    game.EarthActor.prototype.getIncreasePerTick = function () {
        var ws = definitions.workers,
            w,
            i,
            l = ws.length,
            s = this.state,
            num,
            planted = 0,
            chopped = 0,
            total = 0;

        for (i = 0; i < l; i += 1) {
            w = ws[i];
            if (!this.isWorkerBanned(w)) {
                num = s.get(w.name, 0);
                planted += w.yields * num;
                chopped += (w.chop || 0) * num;
            }
        }
        planted *= this.getImprMultiplier('plant') * this.getAbsorptionAndGrowthMutiplier();
        chopped *= this.getImprMultiplier('chop');
        total = planted - chopped;
        if (total < 1000 && total > -1000) {
            return Math.floor(total * 10) / 10;
        }
        return Math.floor(total);
    };
    game.EarthActor.prototype.getLevelPercentProgress = function () {
        var m = this.getLevelMaxProgress(),
            c = this.state.get('levelProgress');
        return Math.round(c * 100 / m);
    };
    game.EarthActor.prototype.getLevelMaxProgress = function () {
        return Math.floor(firstLevelXp * Math.pow(levelProgressMultiplier, this.state.get('level')));
    };
    game.EarthActor.prototype.getWorkerSellPrice = function (worker) {
        return Math.floor(this.getWorkerPrice(worker) / 2);
    };
    game.EarthActor.prototype.getWorkerPrice = function (worker) {
        var s = this.state,
            actual,
            price,
            hireMultiplier = this.getImprMultiplier('hire');
        if (!s.has(worker.name)) {
            return Math.floor(worker.price * hireMultiplier);
        }
        actual = s.get(worker.name);
        price = worker.price;
        if (actual > 0) {
            price += worker.price * Math.pow(worker.increase, actual) - worker.price;
        }
        return Math.floor(price * hireMultiplier);
    };
    game.EarthActor.prototype.hasImprovement = function (name) {
        return this.state.get('improvements').indexOf(name) > -1;
    };
    game.EarthActor.prototype.getImprMultiplier = function (type, baseMultiplier) {
        var s = this.state,
            ic = s.get('improvements'),
            is = definitions.improvements,
            i,
            l = is.length,
            r = typeof baseMultiplier === 'number' ? baseMultiplier : 1,
            tier,
            impr;
        for (i = 0; i < l; i += 1) {
            impr = is[i];
            if (impr.multipliers.hasOwnProperty(type)) {
                if (impr.type === 'research') {
                    tier = s.get(impr.name);
                    if (tier > 0) {
                        r *= Math.pow(impr.multipliers[type], tier);
                    }
                } else if (ic.indexOf(impr.name) > -1) {
                    r *= impr.multipliers[type];
                }
            }
        }
        return r;
    };
    game.EarthActor.prototype.getImprPrice = function (impr) {
        var price = impr.price,
            costMultiplier = this.getImprMultiplier('policyBuyCost'),
            tier;

        if (impr.type === 'research') {
            tier = this.state.get(impr.name) || 0;
            price = price * Math.pow(tier + 1, 4);
        }

        return Math.floor(price * costMultiplier);
    };
    game.EarthActor.prototype.getImprSellPrice = function (impr) {
        return Math.floor(impr.price * 5) * this.getImprMultiplier('policySellCost');
    };

    game.EarthActor.prototype.bannedWorkers = [];
    game.EarthActor.prototype.refreshBannedWorkers = function () {
        var s = this.state,
            ic = s.get('improvements'),
            is = definitions.improvements,
            i,
            l = is.length,
            impr,
            ban = [],
            unban = [];
        for (i = 0; i < l; i += 1) {
            impr = is[i];
            if (ic.indexOf(impr.name) > -1) {
                if (impr.hasOwnProperty('ban')) {
                    ban = ban.concat(impr.ban);
                }
                if (impr.hasOwnProperty('unban')) {
                    unban = unban.concat(impr.unban);
                }
            }
        }
        for (i = 0, l = unban.length; i < l; i += 1) {
            ic = ban.indexOf(unban[i]);
            if (ic > -1) {
                ban.splice(ic, 1);
            }
        }

        this.bannedWorkers = ban;
    };

    game.EarthActor.prototype.isWorkerBanned = function (worker) {
        return this.bannedWorkers.indexOf(worker.name) > -1;
    };

    game.EarthActor.prototype.end = function () {

    };


}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        dom = bloom.require('utilities.dom'),
        game = bloom.require('game');

    game.GameOverScreenComponent = function () {
        core.Component.call(this);
    };

    bloom.inherits(game.GameOverScreenComponent, core.Component);

    game.GameOverScreenComponent.prototype.start = function () {
        setTimeout(function() {
            dom.get('#new-game-btn-from-over').addEventListener('click', this.startNewGame.bind(this));
            dom.get('#main-btn').addEventListener('click', this.backToMain.bind(this));
        }.bind(this), 1);
    };

    game.GameOverScreenComponent.prototype.startNewGame = function () {
        this.getScene().newGame();
    };

    game.GameOverScreenComponent.prototype.backToMain = function () {
        this.getGame().goto('main');
    };

    game.GameOverScreenComponent.prototype.end = function () {

    };




}());

/*global bloom*/
(function () {
    'use strict';
    var core = bloom.require('core'),
        game = bloom.require('game'),
        tween = bloom.require('tween'),
        dom = bloom.require('utilities.dom'),
        easing = bloom.require('tween.easing'),
        keyboard = bloom.require('input.keyboard');

    game.GameScene = function () {
        core.Scene.call(this);
        this.id = 'game';
    };

    bloom.inherits(game.GameScene, core.Scene);

    game.GameScene.prototype.start = function (opts) {
        var self = this;
        this.save = opts.save;

        keyboard.on('keyup', this);

        this.earth  = new game.EarthActor({state: this.save.state});
        this.layer = new core.LayerHTML({
            template: 'game'
        });

        this.canvasLayer = new core.Layer2D({
            width: dom.get('#wrapper').clientWidth,
            height: dom.get('#wrapper').clientHeight - 540 - 30,
            id: 'canvasLandscape'
        });
        this.add(this.layer);
        this.add(this.canvasLayer);
        this.layer.add(this.earth);

        window.onbeforeunload = function() {
            self.save.save();
        };

        this.earth.landscape.setCanvasContext(this.canvasLayer.getContext());
    };

    game.GameScene.prototype.import = function (v) {
        return this.earth.state.import(v);
    };

    game.GameScene.prototype.export = function () {
        return this.earth.state.export();
    };

    game.GameScene.prototype.play = function () {
        if (!!this.pausedLayer) {
            var self = this,
                el = this.pausedLayer.getElement();
            tween.tween({opacity: 1}, {opacity: 0}, 200, function (o) {
                el.style.opacity = o.opacity;
                if (o.opacity <= 0) {
                    self.remove(self.pausedLayer);
                }
            });
        }
    };

    game.GameScene.prototype.pause = function () {
        if (!this.pausedLayer) {
            this.pausedLayer = new core.LayerHTML({
                template: 'in-game-pause',
                classname: 'pause'
            });
        }

        this.save.save();

        var el = this.pausedLayer.getElement();
        tween.tween({opacity: 0}, {opacity: 1}, 200, function (o) {
            el.style.opacity = o.opacity;
        });

        this.add(this.pausedLayer);
        this.pausedLayer.add(new game.PauseScreenComponent());
    };

    game.GameScene.prototype.gameOverHigh = function () {
        this.gameOver('game-over-high', game.GameOverScreenComponent);
    };
    game.GameScene.prototype.gameOverLow = function () {
        this.gameOver('game-over-low', game.GameOverScreenComponent);
    };
    game.GameScene.prototype.win = function () {
        this.gameOver('win', game.WinScreenComponent);
    };
    game.GameScene.prototype.gameOver = function (tpl, component) {
        if (!!this.gameOverLayer) {
            return;
        }
        this.save.save();

        this.gameOverLayer = new core.LayerHTML({
            template: tpl,
            classname: tpl
        });

        var el = this.gameOverLayer.element,
            c = new component();
        tween.tween({opacity: 0}, {opacity: 1}, 200, function (o) {
            el.style.opacity = o.opacity;
        });

        this.add(this.gameOverLayer);
        c.state = this.earth.state;
        this.gameOverLayer.add(c);

        this.earth.pause();
    };
    game.GameScene.prototype.newGame = function () {
        if (!!this.gameOverLayer) {
            this.remove(this.gameOverLayer);
            this.gameOverLayer = null;
        }
        this.save = new core.LocalStorageStrategy({
            id: 'saved',
            state: new core.State()
        });
        this.earth.state = this.save.state;
        this.save.save();
        this.earth.start();
    };

    game.GameScene.prototype.keyupHandler = function (e) {
        if (e.key === keyboard.ESC) {
            this.game.switchPause();
        }
    };

    game.GameScene.prototype.browserWillClose = function () {

    };

    game.GameScene.prototype.end = function () {
        if (!!this.gameOverLayer) {
            this.remove(this.gameOverLayer);
        }
        this.gameOverLayer = null;
        this.save.save();
        keyboard.off('keyup', this);
    };

    game.GameScene.prototype.startTransition = function (previous) {
        var el = this.layer.getElement(),
            cs = this.canvasLayer.getElement();

        tween.tween({opacity: 0}, {opacity: 1}, 400, function (o) {
            el.style.opacity = o.opacity;
            cs.style.opacity = o.opacity;
        }, easing.Linear.None, 400);
    };


    game.GameScene.prototype.endTransition = function (cb, next) {
        var el = this.layer.getElement(),
            cs = this.canvasLayer.getElement(),
            el2;
        if (!!this.pausedLayer) {
            el2 = this.pausedLayer.getElement();
        }
        tween.tween({opacity: 1}, {opacity: 0}, 200, function (o) {
            el.style.opacity = o.opacity;
            cs.style.opacity = o.opacity;
            if (!!el2) {
                el2.style.opacity = o.opacity;
            }
        });
        setTimeout(cb, 400);
    };

}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        dom = bloom.require('utilities.dom'),
        string = bloom.require('utilities.string'),
        math = bloom.require('utilities.math'),
        particles = bloom.require('particles'),
        game = bloom.require('game'),
        definitions = bloom.ns('game.definitions'),

        foliages = ['#39991f', '#40a624', '#4fa139'],
        trunks = ['#5c442b', '#48311a'];

    game.LandscapeComponent = function () {
        core.Component.call(this);
        this.w = dom.get('#wrapper').clientWidth;
        this.h = dom.get('#wrapper').clientHeight - 540 - 30;
    };

    bloom.inherits(game.LandscapeComponent, core.Component);

    game.LandscapeComponent.prototype.setCanvasContext = function (context) {
        this.ccontext = context;
    };

    game.LandscapeComponent.prototype.drawTree = function () {
        var x = math.random(0, this.w),
            s = math.random(4, 16);
        this.drawTreeTrunk(x, s);
        this.drawTreeFoliage(x, s);
    };

    game.LandscapeComponent.prototype.drawTreeTrunk = function (x, height) {
        this.ccontext.fillStyle = trunks[math.random(0, trunks.length - 1)];
        this.ccontext.fillRect(x, this.h - height, 2, height);
    };

    game.LandscapeComponent.prototype.drawTreeFoliage = function (x, height) {
        var ctx = this.ccontext;
        ctx.fillStyle = foliages[math.random(0, foliages.length - 1)];
        ctx.beginPath();
        ctx.arc(x + 1, this.h - height * 1.5, height * 0.8, 0, Math.PI * 2, true);
        ctx.fill();
    };

    game.LandscapeComponent.prototype.start = function () {
        this.container = dom.get('#scene');
        this.particles = new particles.System();
        this.particles.gravity.y = 0.5;
        this.actor.add(this.particles);
    };

    game.LandscapeComponent.prototype.yields = function (num, type) {
        if (num === 0) {
            return;
        }
        var p = new particles.ParticleHTML({
            lifetime: 2000,
            disappear: 1000,
            container: this.container,
            content: '<span class="' + (type || 'trees') + '">' + (Math.floor(num * 10) / 10) + '</span>',
            position: new core.Vector(math.random(0, this.w), 0),
            delay: math.random(0, 1000)
        });
        this.particles.add(p);
    };

    game.LandscapeComponent.prototype.end = function () {
        if (!!this.container) {
            this.container = null;
        }
        if (!!this.particles) {
            this.actor.remove(this.particles);
        }
    };

}());

/*global bloom*/
(function () {
    'use strict';
    var core = bloom.require('core'),
        game = bloom.require('game'),
        tween = bloom.require('tween'),
        easing = bloom.require('tween.easing');

    game.MainScene = function () {
        core.Scene.call(this);
    };

    bloom.inherits(game.MainScene, core.Scene);

    game.MainScene.prototype.start = function () {
        this.layer = new core.LayerHTML({
            template: 'main'
        });
        this.add(this.layer);
    };

    game.MainScene.prototype.end = function () {
        this.remove(this.layer);
    };

    game.MainScene.prototype.startTransition = function (previous) {
        var el = this.layer.getElement(),
            self = this;

        if (previous === null || previous === 'game') {
            tween.tween({opacity: 0}, {opacity: 1}, 400, function (o) {
                el.style.opacity = o.opacity;
            }, easing.Linear.None, 400, function() {
                self.layer.add(new game.MainScreenComponent());
            });
        } else {
            tween.tween({left: -900}, {left: 0}, 400, function (o) {
                el.style.left = o.left + 'px';
            }, easing.Cubic.InOut);
        }
    };
    game.MainScene.prototype.endTransition = function (cb, next) {
        var el = this.layer.getElement();
        if (next === 'game') {
            tween.tween({opacity: 1}, {opacity: 0}, 400, function (o) {
                el.style.opacity = o.opacity;
            });
        } else {
            tween.tween({left: 0}, {left: -900}, 400, function (o) {
                el.style.left = o.left + 'px';
            }, easing.Cubic.InOut);
        }
        setTimeout(cb, 400);
    };
}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        dom = bloom.require('utilities.dom'),
        math = bloom.require('utilities.math'),
        game = bloom.require('game'),
        definitions = bloom.require('game.definitions');

    game.MainScreenComponent = function () {
        core.Component.call(this);
    };

    bloom.inherits(game.MainScreenComponent, core.Component);

    game.MainScreenComponent.prototype.start = function () {
        this.savedGame = new core.LocalStorageStrategy({
            id: 'saved',
            state: new core.State()
        });

        //console.log(this.savedGame, this.savedGame.state.get('over'));
        dom.get('#new-game-btn').addEventListener('click', this.newGame.bind(this));
        dom.get('#continue-game-btn').addEventListener('click', this.continueGame.bind(this));
        if (this.savedGame.exists()) {
            this.savedGame.load();
        }

        if (this.savedGame.state.get('over') === 0) {
            dom.get('#continue-game-btn').setAttribute('class', 'button green');
            dom.get('#continue-game-btn').style.display = 'block';
            dom.get('#new-game-btn').style.display = 'block';
        } else {
            dom.get('#new-game-btn').setAttribute('class', 'button green');
            dom.get('#continue-game-btn').style.display = 'none';
            dom.get('#new-game-btn').style.display = 'block';
        }

        dom.get('#facts').textContent = 'Random fact: ' + this.getFact();
    };

    game.MainScreenComponent.prototype.getFact = function () {
        var d = new Date(),
            h = d.getHours(),
            m = d.getMinutes(),
            rand = Math.random();

        if (h < 4 && m === 42 && rand < 0.3) {
            return 'There is no answer, only consequences of our actions.';
        }
        return definitions.facts[math.random(0, definitions.facts.length)];
    };
    game.MainScreenComponent.prototype.newGame = function () {
        this.getGame().goto('game', {
            save: new core.LocalStorageStrategy({
                id: 'saved',
                state: new core.State()
            })
        });
    };

    game.MainScreenComponent.prototype.continueGame = function () {
        this.getGame().goto('game', {
            save: this.savedGame
        });
    };

    game.MainScreenComponent.prototype.gotoSettings = function () {
        this.getGame().goto('settings');
    };

    game.MainScreenComponent.prototype.gotoCredits = function () {
        this.getGame().goto('credits');
    };

    game.MainScreenComponent.prototype.end = function () {

    };




}());

/*global bloom*/
(function () {
    'use strict';

    var game = bloom.require('game'),
        core = bloom.require('core'),
        math = bloom.require('utilities.math'),
        string = bloom.require('utilities.string'),
        countries = ['the UK', 'France', 'the USA', 'Costa Rica', 'Argentina', 'Ukraine', 'Russia', 'China', 'Australia'],

        disasters = [
            ['radioactive leak', 'a nuclear plant radioactive leak'],
            ['flood', 'a flood'],
            ['tornadoe', 'a tornadoe'],
            ['heat wave', 'an extreme heat wave'],
            ['drought', 'a drought'],
            ['wildfires', 'many wildfires'],
            ['tsunamis', 'tsunamis']
        ],

        titles = ['{0} in {1}',
                     '{1}: {0}'],

        sentences = ['{0} occured in {1}, {2} reported dead.',
                     'Witnesses report {0} in {1}! There would be at least {2} casualties.',
                     '{0} upon {1} would have cause {2} death.'];


    game.NewsGeneratorComponent = function () {
        core.Component.call(this);
    };

    bloom.inherits(game.NewsGeneratorComponent, core.Component);

    // game.NewsGeneratorComponent.prototype.update = function () {
    //     if (Math.random() < 0.0005) {
    //         this.generate();
    //     }
    // };
    game.NewsGeneratorComponent.prototype.generate = function () {
        var country = countries[math.random(0, countries.length - 1)],
            disaster = disasters[math.random(0, disasters.length - 1)],
            dead = math.random(20, 2000),
            sentence = string.format(sentences[math.random(0, sentences.length - 1)], disaster[1], country, dead),
            title = string.format(titles[math.random(0, titles.length - 1)], disaster[0], country, dead);

        this.getComponent(game.ScreenComponent).displayNews('news',
                    string.format('Breaking news: <span>{0}</span>', string.capitalize(title)), sentence);
    };
}());
/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        dom = bloom.require('utilities.dom'),
        game = bloom.require('game');

    game.PauseScreenComponent = function () {
        core.Component.call(this);
    };

    bloom.inherits(game.PauseScreenComponent, core.Component);

    game.PauseScreenComponent.prototype.start = function () {
        dom.get('#pause-play-btn').addEventListener('click', this.backToGame.bind(this));
        //dom.get('#save-btn').addEventListener('click', this.saveGame.bind(this));
        dom.get('#main-btn').addEventListener('click', this.backToMain.bind(this));
    };

    game.PauseScreenComponent.prototype.backToGame = function () {
        this.getGame().play();
    };

    game.PauseScreenComponent.prototype.saveGame = function () {
        this.getScene().displaySave();
    };

    game.PauseScreenComponent.prototype.backToMain = function () {
        this.getGame().goto('main');
    };

    game.PauseScreenComponent.prototype.end = function () {

    };




}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        utilities = bloom.ns('game.utilities'),
        dom = bloom.require('utilities.dom'),
        string = bloom.require('utilities.string'),
        math = bloom.require('utilities.math'),
        keyboard = bloom.require('input.keyboard'),
        components = bloom.require('core.components'),
        particles = bloom.require('particles'),
        game = bloom.require('game'),
        tween = bloom.require('tween'),
        definitions = bloom.ns('game.definitions'),

        currentTooltipLi,
        currentTooltipData;

    game.ScreenComponent = function () {
        core.Component.call(this);
    };

    bloom.inherits(game.ScreenComponent, core.Component);

    game.ScreenComponent.prototype.start = function () {
        dom.get('#plantTree').addEventListener('mouseup', this.actor.plantTree.bind(this.actor));
        dom.get('#chopTree').addEventListener('mouseup', this.actor.chopTree.bind(this.actor));
        dom.get('#pause').addEventListener('click', this.getGame().pause.bind(this.getGame()));

        this.addButtons();
        this.refreshWorkerButtons();
        this.initParticles();
    };


    game.ScreenComponent.prototype.refreshUI = function () {
        var s = this.state,
            a = this.actor,
            m = Math.floor(s.get('month')),
            trees = s.get('trees'),
            ipc = a.getIncreasePerTick(),
            igpc = a.getIncreaseGoldPerTick(),

            emittedTonsPerWeek = a.getCurrentEmissionsTonsPerWeek(),
            absorbedTonsPerWeek = a.getCurrentAbsorptionPerWeek(),

            emittedPpmPerYear = a.getCurrentEmissionsPerYear(),
            absorbedPpmPerYear = a.getCurrentAbsorptionPerYear(),

            tonsDiff = Math.round(emittedTonsPerWeek - absorbedTonsPerWeek),
            totalCO2MetricTons = Math.round(a.getCurrentCO2InTons()),

            treeGrowing = s.get('growing'),

            tp = s.get('tp'),
            tpAnomaly = (tp - 14),
            tpYearlyDiff = s.get('yearlyTemperatureDiff'),

            ppmDiff = Math.round(a.getActualPPMPerYear() * 1000) / 1000;


        dom.get('#click-plant-multiplier').textContent = 'x' + utilities.prettify(Math.floor(a.getImprMultiplier('clickPlant')));
        dom.get('#click-chop-multiplier').textContent = 'x' + utilities.prettify(Math.floor(a.getImprMultiplier('clickChop')));

        dom.get('#trees').textContent = utilities.prettify(Math.round(trees));
        //dom.get('#weeklyGrown').textContent = utilities.prettify(Math.round(treeGrowing[0] * this.actor.getAbsorptionAndGrowthMutiplier())) + '/week';
        dom.get('#growingTrees').textContent = utilities.prettify(Math.round(math.sum(s.get('growing'))));
        dom.get('#increasePerTick').textContent = (ipc > 0 ? '+' : '') + utilities.prettify(ipc) + '/week';
        dom.get('#gold').textContent = utilities.prettify(Math.round(s.get('gold')));
        dom.get('#increaseGoldPerTick').textContent = (igpc > 0 ? '+' : '') + utilities.prettify(igpc) + '/week';

        dom.get('#metricTons').textContent = utilities.prettify(Math.max(totalCO2MetricTons, 0));
        if (tonsDiff >= 0) {
            dom.get('#metricTons').setAttribute('class', 'stat-icon up-i');
        } else {
            dom.get('#metricTons').setAttribute('class', 'stat-icon down-i');
        }

        dom.get('#ppmTonsPerWeek').textContent = utilities.prettify(Math.round(emittedTonsPerWeek));
        dom.get('#absorptionPerWeek').textContent = utilities.prettify(Math.round(absorbedTonsPerWeek));

        dom.get('#tonsDiff').textContent = utilities.prettify(tonsDiff);


        dom.get('#ppmIncreasePerYear').textContent = emittedPpmPerYear.toFixed(3); //Math.round(emittedPpmPerYear * 1000) / 1000;
        dom.get('#ppmAbsorptionPerYear').textContent = absorbedPpmPerYear.toFixed(3); //Math.round(absorbedPpmPerYear * 1000) / 1000;
        dom.get('#ppmDiff').textContent = ppmDiff.toFixed(3);

        dom.get('#ppm').textContent = utilities.prettify(Math.max(0, Math.round(s.get('ppm'))));
        if (ppmDiff >= 0) {
            dom.get('#ppm').setAttribute('class', 'stat-icon up-i');
        } else {
            dom.get('#ppm').setAttribute('class', 'stat-icon down-i');
        }

        dom.get('#actualAverageTemperature').textContent = this.formatTemperature(tp);
        dom.get('#anomalyTemperature').textContent = this.formatTemperature(tpAnomaly, true);
        //dom.get('#yearlyTemperatureDiff').textContent = tpYearlyDiff;
        if (tpYearlyDiff > 0) {
            dom.get('#anomalyTemperature').setAttribute('class', 'stat-icon up-i');
        } else {
            dom.get('#anomalyTemperature').setAttribute('class', 'stat-icon down-i');
        }
        if (tpAnomaly > 0) {
            dom.get('#scene').style.backgroundColor = 'rgba(157, 85, 27, ' + (tpAnomaly / 4) + ')';
        } else if (tpAnomaly < 0) {
            dom.get('#scene').style.backgroundColor = 'rgba(18, 160, 191, ' + (-tpAnomaly / 7 ) + ')';
        }

        //dom.get('#absorbed').textContent = utilities.prettify(Math.round(s.get('absorbed') * 1000) / 1000);
        dom.get('#levelProgress').textContent = Math.round(s.get('levelProgress'));
        dom.get('#maxLevelProgress').textContent = a.getLevelMaxProgress();
        dom.get('#levelProgressBar').style.width = a.getLevelPercentProgress() + '%';
        dom.get('#level').textContent = Math.round(s.get('level'));
        dom.get('#date').textContent = (m < 10 ? '0' + m : m) + '/' + s.get('year');

        if (trees <= 0) {
            dom.get('#chopTree').setAttribute('disabled', 'disabled');
            dom.get('#chopTree').setAttribute('class', 'disabled');
        } else {
            dom.get('#chopTree').removeAttribute('disabled');
            dom.get('#chopTree').removeAttribute('class');
        }
    };


    game.ScreenComponent.prototype.addButtons = function () {
        var l = this.state.get('level'),
            a = this.state.get('achievements'),
            workers = definitions.workers,
            improvements = definitions.improvements;

        workers.forEach(function (worker) {
            this.addWorkerButton(worker);
        }.bind(this));

        improvements.forEach(function (impr) {
            this.addImprovement(impr);
        }.bind(this));
    };

    game.ScreenComponent.prototype.refresh = function () {
        this.refreshWorkerButtons();
        this.refreshImprovements();
    };
    game.ScreenComponent.prototype.refreshWorkerButtons = function () {
        var workers = definitions.workers;
        workers.forEach(function (worker) {
            this.refreshWorkerButton(worker);
        }.bind(this));
    };

    game.ScreenComponent.prototype.refreshImprovements = function () {
        var improvements = definitions.improvements;
        improvements.forEach(function (impr) {
            this.refreshImprovement(impr);
        }.bind(this));
    };

    game.ScreenComponent.prototype.addWorkerButton = function (worker) {
        var s = this.state,
            container = dom.get('#workers'),
            id = string.urlize(worker.name),
            li,
            button,
            icon,
            title,
            num,
            price,
            max,
            quantity;

        if (dom.get('#' + id, container)) {
            return;
        }

        li = dom.create('li', {
            id: id
        });
        button = dom.create('button', {
            'class': 'button'
        });
        icon = dom.create('span', {
            'class': 'icon ' + id
        });
        title = dom.create('span', {
            'class': 'title',
            innerHTML: worker.name
        });
        num = dom.create('span', {
            'class': 'num',
            innerHTML: s.get(worker.name) || 0
        });
        price = dom.create('span', {
            'class': 'price',
            innerHTML: worker.price
        });
        max = dom.create('span', {
            'class': 'max',
            innerHTML: worker.max
        });
        quantity = dom.create('span', {
            'class': 'quantity'
        });

        quantity.appendChild(num);
        quantity.appendChild(max);
        button.addEventListener('click', function () {
            if (keyboard.getKey('shift')) {
                this.actor.sell(worker, keyboard.getKey('alt') ? 10 : 1);
            } else {
                this.actor.hire(worker, keyboard.getKey('alt') ? 10 : 1);
            }
            this.updateTooltip();
        }.bind(this));

        button.addEventListener('mouseenter', function () {
            this.displayTooltip(li, worker);
        }.bind(this));

        button.addEventListener('mouseleave', function () {
            this.hideTooltip(worker);
        }.bind(this));

        button.appendChild(icon);
        button.appendChild(title);
        button.appendChild(quantity);
        button.appendChild(price);
        li.appendChild(button);
        container.appendChild(li);
    };
    game.ScreenComponent.prototype.refreshWorkerButton = function (worker) {
        var s = this.state,
            id = string.urlize(worker.name),
            li = dom.get('#' + id),
            num,
            priceSpan = dom.get('.price', li),
            quantitySpan = dom.get('.quantity', li),
            price;

        if (!li) {
            return;
        }
        price = this.actor.getWorkerPrice(worker);

        priceSpan.innerHTML = utilities.prettify(price);

        if (s.get('level') < worker.level) {
            li.setAttribute('class', 'unavailable level');
            priceSpan.style.display = 'none';
            quantitySpan.style.display = 'none';
            return;
        } else {
            priceSpan.style.display = 'block';
            quantitySpan.style.display = 'block';
        }

        dom.get('.num', li).innerHTML = s.get(worker.name) || 0;
        if (s.get('gold') < price) {
            li.setAttribute('class', 'unavailable cost');
        } else if (this.actor.isWorkerBanned(worker)) {
            li.setAttribute('class', 'unavailable ban');
        } else {
            li.setAttribute('class', 'available');
        }
    };

    game.ScreenComponent.prototype.addImprovement = function (impr) {
        var s = this.state,
            container = dom.get(impr.type === 'research' ? '#research' : '#improvements'),
            id = string.urlize(impr.name),
            li,
            button,
            icon,
            title,
            num,
            price,
            max,
            quantity;

        if (dom.get('#' + id, container)) {
            return;
        }

        li = dom.create('li', {
            id: id,
            'data-size': impr.hasOwnProperty('size') ? impr.size : 'small'
        });
        button = dom.create('button', {
            'class': 'button research'
        });
        icon = dom.create('span', {
            'class': 'icon ' + id
        });
        title = dom.create('span', {
            'class': 'title',
            innerHTML: this.getImprovementTitle(impr)
        });
        price = dom.create('span', {
            'class': 'price',
            innerHTML: this.actor.getImprPrice(impr)
        });
        quantity = dom.create('span', {
            'class': 'quantity'
        });

        button.addEventListener('click', function () {
            if (keyboard.getKey('shift')) {
                this.actor.revokePolicy(impr);
            } else {
                this.actor.buyImprovement(impr);
            }
            this.updateTooltip();
        }.bind(this));

        button.addEventListener('mouseenter', function () {
            this.displayTooltip(li, impr);
        }.bind(this));

        button.addEventListener('mouseleave', function () {
            this.hideTooltip(impr);
        }.bind(this));

        button.appendChild(icon);
        button.appendChild(title);
        button.appendChild(price);
        button.appendChild(quantity);
        li.appendChild(button);
        container.appendChild(li);
        this.refreshImprovement(impr);
    };
    game.ScreenComponent.prototype.getImprovementTitle = function (impr) {
        return impr.name;
    };
    game.ScreenComponent.prototype.getImprovementTiers = function (impr) {
        if (impr.type === 'research') {
            return '' + (this.state.get(impr.name) || 0) + '/' + impr.tiers;
        }
        return '';
    };
    game.ScreenComponent.prototype.refreshImprovement = function (impr) {
        var s = this.state,
            id = string.urlize(impr.name),
            li = dom.get('#' + id),
            num,
            price,
            priceSpan = dom.get('.price', li),
            quantitySpan = dom.get('.quantity', li),
            bought = dom.get('.bought', li),
            hasBeenBought = s.get('improvements').indexOf(impr.name) > -1,
            maxTierReached = impr.type === 'research' ? (s.get(impr.name) || 0) === impr.tiers : false;

        if (!li) {
            return;
        }

        dom.get('.title', li).innerHTML = this.getImprovementTitle(impr);

        price = this.actor.getImprPrice(impr);

        if (impr.type === 'research') {
            quantitySpan.style.display = 'block';
            quantitySpan.innerHTML = this.getImprovementTiers(impr);
        }

        // Already bought
        if (hasBeenBought || maxTierReached) {
            if (!!priceSpan) {
                priceSpan.style.display = 'none';
                if (!bought) {
                    dom.get('button', li).appendChild(dom.create('span', {'class': 'mini-icon bought'}));
                } else {
                    bought.style.display = 'block';
                }
                li.setAttribute('class', 'bought');
            }
            return;
        }
        if (!!bought) {
            bought.style.display = 'none';
        }
        // Not enough level
        if (s.get('level') < impr.level) {
            li.setAttribute('class', 'unavailable level');
            quantitySpan.style.display = 'none';
            priceSpan.style.display = 'none';
            return;
        }

        priceSpan.style.display = 'block';
        quantitySpan.style.display = 'block';
        priceSpan.innerHTML = utilities.prettify(price);

        // Not enough gold
        if (s.get('gold') < price) {
            li.setAttribute('class', 'unavailable cost');
            return;
        }

        // Available
        li.setAttribute('class', 'available');
    };




    game.ScreenComponent.prototype.initParticles = function () {
        this.system = new particles.System();
        this.emitter = new particles.Emitter();
        this.pContainer = dom.get('.layer-html.game');

        this.actor.add(this.system);
    };

    game.ScreenComponent.prototype.displayAchievement = function (achievement) {
        this.displayNews('achievement',
                         string.format('New achievement: <span>{0}</span>!', achievement.name),
                         achievement.desc);
        /*
        this.emitter.emit(this.system, 20, function () {
            var rot = math.random(0, 10),
                x = math.random(-30, 30) / 10;

            return new particles.ParticleHTML({
                container: this.pContainer,
                mass: 1.03,
                velocity: new core.Vector(x, math.random(20, 50) / 10),
                classname: 'mini-icon star',
                position: new core.Vector(665, 360),
                delay: math.random(0, 50),
                lifetime: 2000,
                disappear: 1000,
                rotation: x < 0 ? -rot : rot
            });
        }.bind(this));
        */
    };
    game.ScreenComponent.prototype.displayNews = function (type, titleText, text) {
        var s = this.state,
            container = dom.get('#news'),
            li = dom.create('li', {
                'class': type
            }),
            icon = dom.create('span', {
                'class': 'icon-news ' + type
            }),
            title = dom.create('header', {
                'class': 'title',
                innerHTML: string.capitalize(titleText)
            }),
            desc = dom.create('p', {
                'class': 'desc',
                innerHTML: string.capitalize(text)
            }),
            l;

        //li.appendChild(icon);
        li.appendChild(title);
        li.appendChild(desc);
        tween.tween({opacity: 0}, {opacity: 1}, 200, function(o, time, done) {
            if (done) {
                li.removeAttribute('style');
            } else {
                li.style.opacity = o.opacity;
            }
        });
        container.insertBefore(li, dom.get('li', container));

        l = container.children.length;
        if (l > 30) {
            container.removeChild(container.children[l - 1]);
        }
    };

    game.ScreenComponent.prototype.updateTooltip = function () {
        if (!!currentTooltipLi) {
            this.displayTooltip(currentTooltipLi, currentTooltipData);
        }
    };
    game.ScreenComponent.prototype.displayTooltip = function (li, workerOrImprOrText) {
        currentTooltipLi = li;
        currentTooltipData = workerOrImprOrText;
        if (!this.tooltip) {
            this.buildTooltip();
        }

        var tt = this.tooltip,
            s = this.state,
            desc = dom.get('.desc', tt),
            pos = dom.absolute(li, 'wrapper'),
            isImpr = typeof workerOrImprOrText === 'object' && workerOrImprOrText.hasOwnProperty('multipliers'),
            needLevelUp = typeof workerOrImprOrText === 'object' && workerOrImprOrText.level > this.state.get('level'),
            bought = false;

        if (isImpr) {
            if (workerOrImprOrText.type !== 'research') {
                if (s.get('improvements').indexOf(workerOrImprOrText.name) > -1) {
                    bought = true;
                }
            }
        }

        tt.setAttribute('class', 'tooltip');

        if (!!desc && !needLevelUp) {
            desc.innerHTML = typeof workerOrImprOrText === 'string' ? workerOrImprOrText : this.formatDescription(workerOrImprOrText);
        } else {
            desc.innerHTML = '';
        }
        if (needLevelUp) {
            desc.innerHTML += 'Available at level ' + workerOrImprOrText.level + '.';
        } else if (typeof workerOrImprOrText === 'object' && workerOrImprOrText.price > this.state.get('gold') && !bought) {
            desc.innerHTML += '<br /><br />Not enough gold!';
        }

        tt.style.left = pos.left + 'px';
        this.pContainer.appendChild(tt);
        tt.style.top = (pos.top - tt.offsetHeight - 3) + 'px';
    };
    game.ScreenComponent.prototype.formatDescription = function (workerOrImpr) {
        var txt = workerOrImpr.desc,
            n;

        // Is improvement
        if (workerOrImpr.hasOwnProperty('multipliers')) {
            return this.formatPolicyDescription(workerOrImpr);
        }


        if (txt.indexOf('[chop]') > -1) {
            txt = this.formatDescriptionChop(workerOrImpr, txt);
        }
        if (txt.indexOf('[yields]') > -1) {
            txt = this.formatDescriptionYields(workerOrImpr, txt);
        }
        if (txt.indexOf('[yieldsGold]') > -1) {
            txt = this.formatDescriptionGold(workerOrImpr, txt);
        }
        n = this.state.get(workerOrImpr.name);
        if (n > 0) {
            txt += string.format('<br /><br />[Shift + Click] to sell for {0} gold',
                utilities.prettify(this.actor.getWorkerSellPrice(workerOrImpr), '&nbsp;'));
        }
        if (this.actor.isWorkerBanned(workerOrImpr)) {
            txt += string.format('<br /><br />A policy prevent this worker to be functional!',
                utilities.prettify(this.actor.getWorkerSellPrice(workerOrImpr), '&nbsp;'));
        }


        return txt;
    };

    game.ScreenComponent.prototype.formatPolicyDescription = function (impr) {
        var txt = impr.desc,
            has;

            // Cant revoke research
        if (impr.hasOwnProperty('type') && impr.type === 'research') {
            return txt;
        }

        has = this.state.get('improvements').indexOf(impr.name) > -1;
        if (has) {
            txt += string.format('<br /><br />[Shift + Click] to revoke for {0} gold',
                utilities.prettify(this.actor.getImprSellPrice(impr), '&nbsp;'));
        }


        return txt;
    };

    game.ScreenComponent.prototype.formatDescriptionChop = function (worker, txt) {
        var num = worker.chop * this.actor.getImprMultiplier('chop');
        if (num >= 10) {
            num = Math.floor(num);
        } else if (num % 1 !== 0) {
            num = num.toFixed(1);
        }
        return txt.replace('[chop]', utilities.prettify(num, '&nbsp;') + ' ' +
                 (num <= 1 ? 'tree' : 'trees'));
    };

    game.ScreenComponent.prototype.formatDescriptionYields = function (worker, txt) {
        var num = worker.yields * this.actor.getImprMultiplier('plant');
        if (num >= 10) {
            num = Math.floor(num);
        } else if (num % 1 !== 0) {
            num = num.toFixed(1);
        }
        return txt.replace('[yields]', utilities.prettify(num, '&nbsp;') + ' ' +
                 (num <= 1 ? 'tree' : 'trees'));
    };

    game.ScreenComponent.prototype.formatDescriptionGold = function (worker, txt) {
        var num = worker.yieldsGold * this.actor.getImprMultiplier('yieldsGold');
        if (num >= 10) {
            num = Math.floor(num);
        } else if (num % 1 !== 0) {
            num = num.toFixed(1);
        }
        return txt.replace('[yieldsGold]', utilities.prettify(num, '&nbsp;') + ' gold');
    };

    game.ScreenComponent.prototype.formatTemperature = function (celsius, showPlus) {
        var t = celsius;

        t = Math.round(t * 100) / 100;
        if (t > 0 && !!showPlus) {
            t = '+' + t;
        }
        return t + '°C';
    };

    game.ScreenComponent.prototype.hideTooltip = function (li, workerOrImpr) {
        if (!!this.tooltip) {
            this.pContainer.removeChild(this.tooltip);
        }
        currentTooltipLi = null;
    };
    game.ScreenComponent.prototype.buildTooltip = function () {
        var tt = dom.create('div', {
            'class': 'tooltip'
        });
        tt.appendChild(dom.create('p', {'class': 'desc'}));
        tt.appendChild(dom.create('ul', {'class': 'notes'}));
        this.tooltip = tt;
    };

    game.ScreenComponent.prototype.end = function () {

    };


}());

/*global bloom*/
(function () {
    'use strict';
    var core = bloom.require('core'),
        game = bloom.require('game'),
        tween = bloom.require('tween'),
        easing = bloom.require('tween.easing');

    game.SettingsScene = function () {
        core.Scene.call(this);
        this.id = 'settings';
    };

    bloom.inherits(game.SettingsScene, core.Scene);

    game.SettingsScene.prototype.start = function () {
        if (!this.layer) {
            this.layer = new core.LayerHTML({
                template: 'settings'
            });
        }
        this.add(this.layer);
        this.layer.add(new game.SettingsScreenComponent());
    };

    game.SettingsScene.prototype.startTransition = function () {
        var el = this.layer.getElement();
        tween.tween({left: 900}, {left: 0}, 400, function (o) {
            el.style.left = o.left + 'px';
        }, easing.Cubic.InOut);
    };

    game.SettingsScene.prototype.endTransition = function (cb) {
        var el = this.layer.getElement();
        tween.tween({left: 0}, {left: 900}, 400, function (o) {
            el.style.left = o.left + 'px';
        }, easing.Cubic.InOut);
        setTimeout(cb, 420);
    };
}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        dom = bloom.require('utilities.dom'),
        game = bloom.require('game');

    game.SettingsScreenComponent = function () {
        core.Component.call(this);
    };

    bloom.inherits(game.SettingsScreenComponent, core.Component);

    game.SettingsScreenComponent.prototype.start = function () {
        dom.get('#go-back-btn').addEventListener('click', this.backToMain.bind(this));
    };

    game.SettingsScreenComponent.prototype.backToMain = function () {
        this.getGame().goto('main');
    };

    game.SettingsScreenComponent.prototype.end = function () {

    };




}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        dom = bloom.require('utilities.dom'),
        string = bloom.require('utilities.string'),
        math = bloom.require('utilities.math'),
        game = bloom.require('game');

    game.TutorialComponent = function () {

    };

    bloom.inherits(game.TutorialComponent, core.Component);

    game.TutorialComponent.prototype.start = function () {

    };

    game.TutorialComponent.prototype.stepOne = function () {

    };

    game.TutorialComponent.prototype.end = function () {

    };

}());

/*global bloom*/

(function () {
    'use strict';

    var core = bloom.require('core'),
        dom = bloom.require('utilities.dom'),
        game = bloom.require('game');

    game.WinScreenComponent = function () {
        core.Component.call(this);
    };

    bloom.inherits(game.WinScreenComponent, core.Component);

    game.WinScreenComponent.prototype.start = function () {
        setTimeout(function() {
            dom.get('#new-game-btn-from-over').addEventListener('click', this.startNewGame.bind(this));
            dom.get('#main-btn').addEventListener('click', this.backToMain.bind(this));
        }.bind(this), 1);

        if (this.state.has('Eco dome') && this.state.get('ppm') > 500) {
            dom.get('#win-message').textContent = 'You safely eat popcorn in your Eco dome, while outside the world is burning. Thousands of climate migrants beg the entrance but you won\'t let them in. They fucked up Earth, isn\'t it?';
        } else if (this.state.has('Eco dome') && this.state.get('tp') < 280) {
            dom.get('#win-message').textContent = 'What a time to be alive! It\'s snowing outside the Eco dome. Humanity is freezing, but no worry, you and your rich friends are safe. Well done.';
        }
    };

    game.WinScreenComponent.prototype.startNewGame = function () {
        this.getScene().newGame();
    };

    game.WinScreenComponent.prototype.backToMain = function () {
        this.getGame().goto('main');
    };

    game.WinScreenComponent.prototype.end = function () {

    };




}());

/*global bloom*/

(function () {
    'use strict';

    var utilities = bloom.ns('game.utilities');

    utilities.prettify = function (num, separator) {
        var s = num.toString().split('.'),
            left = s[0],
            right = !!s[1] ? '.' + s[1] : '',
            i = 0,
            l = left.length - 1,
            r = '';
        while (l > -1) {
            r = left[l] + r;
            i += 1;
            if (i === 3) {
                r = ' ' + r;
                i = 0;
            }
            l -= 1;
        }
        r = r.trim() + right;
        if (typeof separator === 'string') {
            r = r.replace(' ', separator);
        }
        return r;
    };

}());
/*global bloom*/

(function () {
    'use strict';

    var definitions = bloom.ns('game.definitions');

    definitions.achievements = [{
        name: 'Gardener',
        unique: true,
        key: 'totalTrees',
        value: 5,
        desc: 'You\'ve grown 5 trees! That\'s a very good start old chap!'
    }, {
        name: 'Planter',
        unique: true,
        key: 'totalTrees',
        value: 100,
        desc: 'You\'ve grown 100 trees. Well done!'
    }, {
        name: 'Master Planter',
        unique: true,
        key: 'totalTrees',
        value: 1000,
        desc: 'You\'ve grown 1000 trees! We\'re getting serious...'
    },




    /// HIRED
    {
        name: 'Junior Manager',
        unique: true,
        key: 'hires',
        value: 10,
        desc: 'You\'ve hired 10 people to help you.'
    }, {
        name: 'Senior Manager',
        unique: true,
        key: 'hires',
        value: 50,
        desc: 'You\'ve hired 50 people to help you.'
    }, {
        name: 'VP Manager',
        unique: true,
        key: 'hires',
        value: 200,
        desc: 'You\'ve hired 200 people to help you.'
    },

    /// CLICKS
    {
        name: 'Toddler Clicker',
        unique: true,
        key: 'clicks',
        value: 500,
        desc: 'You clicked 500 times already. How is your finger?'
    }, {
        name: 'Junior Clicker',
        unique: true,
        key: 'clicks',
        value: 5000,
        desc: 'You clicked 5000 times already. Ok.'
    }, {
        name: 'Senior Clicker',
        unique: true,
        key: 'clicks',
        value: 10000,
        desc: '10000 clicks!! That\'s something'
    }, {
        name: 'Senior Clicker',
        unique: true,
        key: 'clicks',
        value: 50000,
        desc: 'Looks like you\'re going somewhere!'
    }];

}());
/*global bloom*/

(function () {
    'use strict';

    var definitions = bloom.ns('game.definitions');

    definitions.facts = [
        'Temperature lags 30 years behind CO2 concentration.',
        'Trees take usually one year to grow enough to absorb CO2 and be chopped.',
        'The Eco dome wins you the game. But is that what you really want?',
        'Researches can significantly improve your clicks!',
        'If the temperature anomaly exceed 3.5°C, you lose!',
        'If the temperature anomaly pass under -6°C, you lose.',
        'If the CO2 concentration goes below 230PPM, you\'re good for an Ice Age.',
        'The big green button let you plant trees.',
        'The number of growing trees is visible in a tooltip when hovering the top trees counter.'
    ];
}());
/*global bloom*/

(function () {
    'use strict';

    var definitions = bloom.ns('game.definitions');

    definitions.improvements = [{
        name: 'Eco Click',
        type: 'research',
        level: 0,
        price: 50,
        multipliers: {
            clickPlant: 2
        },
        tiers: 20,
        yields: 0,
        desc: 'Improves each planting click by 100%.'
    }, {
        name: 'Fortune Click',
        type: 'research',
        level: 0,
        price: 50,
        multipliers: {
            clickChop: 2
        },
        tiers: 20,
        yields: 0,
        desc: 'Improves each chopping click by 100%.'
    }, {
        name: 'XP Click',
        type: 'research',
        level: 1,
        price: 500,
        multipliers: {
            levelProgressClick: 2
        },
        tiers: 5,
        yields: 0,
        desc: 'Doubles level progress for each click.'
    }, {
        name: 'Permaculture',
        type: 'research',
        level: 2,
        price: 1500,
        multipliers: {
            plant: 1.1
        },
        tiers: 10,
        yields: 0,
        desc: 'Workers plant 10% more trees.'
    }, {
        name: 'Blue Manager',
        type: 'research',
        level: 3,
        price: 2500,
        multipliers: {
            workerLevelProgressPerTick: 1.01
        },
        tiers: 10,
        yields: 0,
        desc: 'Each worker produces 0.01 XP every week.'
    }, {
        name: 'Gold Manager',
        type: 'research',
        level: 4,
        price: 5000,
        multipliers: {
            hire: 0.95,
            yieldsGold: 1.2
        },
        tiers: 10,
        yields: 0,
        desc: 'Workers cost is reduced by 5%. Advocates and Activists raise 20% more money.'
    }, {
        name: 'Forestry tech',
        type: 'research',
        level: 5,
        price: 50000,
        multipliers: {
            clickPlant: 2,
            plant: 1.1
        },
        tiers: 5,
        yields: 0,
        desc: 'Improves planting clicks by 100%. Improve workers planting rate by 10%.'
    }, {
        name: 'Harvest Tech',
        type: 'research',
        level: 5,
        price: 50000,
        multipliers: {
            clickChop: 2,
            chop: 1.1
        },
        tiers: 5,
        yields: 0,
        desc: 'Improves chopping clicks by 100%. Workers chop 10% more trees.'
    }, {
        name: 'Net of Stuff',
        type: 'research',
        level: 6,
        price: 250000,
        multipliers: {
            plant: 1.1,
            chop: 1.1,
            clickChop: 1.1,
            clickPlant: 1.1,
            yieldsGold: 1.2,
            ppmPerYearMultiplier: 1.02
        },
        tiers: 5,
        yields: 0,
        desc: 'Connect the trees! And everything else. Improves planting and chopping clicks by 10%, workers planting, chopping and gold raising rate by 10%. CO2 emissions increase by 2%.'
    }, {
        name: 'GMOs',
        type: 'research',
        level: 7,
        price: 500000,
        multipliers: {
            plant: 1.2,
            resistance: 1.1
        },
        yields: 0,
        tiers: 5,
        desc: 'Genetically modified trees grow fast! Increase planting rate by 20%. Increase trees resistance to diseases by 10%.'
    }, {
        name: 'Eco dome',
        type: 'research',
        level: 20,
        price: 100000000000,
        //price: 1000000000,
        multipliers: {},
        size: 'large',
        yields: 0,
        tiers: 1,
        desc: 'Save your rich ass from global warming: build an Eco dome, that will protect you and your peers for thousands of years. Win the game.'
    },














    {
        name: 'Eco merchandise',
        level: 0,
        price: 100,
        multipliers: {
            ppmPerYearMultiplier: 1.001
        },
        yields: 2,
        desc: 'Sell some merch branded: "Save the planet!". CO2 emissions increased by 0.1%. 2 extra gold per week.'
    }, {
        name: 'Media Campaign',
        level: 1,
        price: 1000,
        multipliers: {
            plant: 1.10
        },
        yields: 0,
        desc: 'Boost planting with a Media Campaign. Increase workers planting rate by 10%.'
    }, {
        name: 'Free firewood',
        level: 2,
        price: 2000,
        multipliers: {
            ppmPerYearMultiplier: 1.01,
            chop: 1.2
        },
        yields: 40,
        desc: 'Freedom of getting firewood! Increase chop rate by 20%, increase CO2 emissions by 1%. 40 extra gold per week.'
    }, {
        name: 'National Parks',
        level: 3,
        price: 5000,
        multipliers: {
            ppmPerYearMultiplier: 0.99,
            chop: 0.95
        },
        desc: 'Protect the nature! Reduce chopping rate by 5%, decrease CO2 emissions by 1%.'
    }, {
        name: 'Free market',
        level: 4,
        price: 10000,
        multipliers: {
            chop: 1.2,
        },
        yields: 100,
        desc: 'Increase chopping rate by 20%. 100 gold per week.'
    },{
        name: 'Recycling act',
        level: 5,
        price: 100000,
        multipliers: {
            ppmPerYearMultiplier: 0.95
        },
        yields: 0,
        desc: 'Cut CO2 emissions by 5%.'
    }, {
        name: 'Lobbying',
        level: 6,
        price: 200000,
        multipliers: {
            policyBuyCost: 0.9,
            policySellCost: 0.8,
            plant: 0.8,
            chop: 0.8
        },
        yields: 0,
        desc: 'Take on the Congress! Decrease the price of adopting policies by 10%, revoking policies costs 20% less. Decrease workers planting and chopping rate by 20%.'
    }, {
        name: 'Popular initiative',
        level: 7,
        price: 500000,
        multipliers: {
            plant: 1.50,
            chop: 0.80
        },
        yields: 0,
        desc: 'Workers plant trees on their free time! And sometimes on work time. Increase planting rate by 50%, reduce chopping rate by 20%.'
    }, {
        name: 'UBI',
        level: 8,
        price: 1000000,
        multipliers: {
            ppmPerYearMultiplier: 0.90,
            plant: 1.2,
            chop: 1.2
        },
        yields: 0,
        desc: 'Universal Basic Income provides every human a salary: makes people feel valuable. Decrease CO2 emissions by 10%. Increase workers planting and chopping rate by 20%.'
    },
    {
        name: 'Air traffic ban',
        level: 9,
        price: 2000000,
        multipliers: {
            ppmPerYearMultiplier: 0.95
        },
        yields: 0,
        ban: ['Plane', 'Helicopter'],
        desc: 'Decrease CO2 emissions by 5%. Plane and helicopter workers are grounded unless "Emergency State" is adopted.'
    },
    {
        name: 'Emergency State',
        level: 10,
        price: 10000000,
        multipliers: {
            plant: 0.5,
            clickPlant: 0.5
        },
        yields: 0,
        ban: ['Activist', 'Advocate'],
        unban: ['Plane', 'Helicopter'],
        desc: 'Also known as Police State! Plane and helicopter workers operational even if "Air traffic ban" policy adopted. Activists and Advocates can\'t demonstrate. Workers and and click planting divided by 2.'
    },

    {
        name: 'Meat cut act',
        level: 11,
        price: 20000000,
        multipliers: {
            ppmPerYearMultiplier: 0.95
        },
        yields: 0,
        desc: 'Cut CO2 emissions by 5%.'
    }, {
        name: 'Carbon tax',
        level: 12,
        price: 50000000,
        multipliers: {
            ppmPerYearMultiplier: 0.9
        },
        yields: 5000,
        desc: 'Cut CO2 emissions by 10%, gain 5000 gold every week.'
    },
    {
        name: 'Free-trade Zones',
        level: 13,
        price: 50000000,
        multipliers: {
            chop: 1.50,
            ppmPerYearMultiplier: 1.2
        },
        yields: 10000,
        desc: 'Let companies do their business behind closed doors, and give them yuge tax cuts. Increase workers chopping rate by 50%. Increase CO2 emissions by 20%. 10 000 extra gold per week, thanks to corruption.'
    }, {
        name: 'Coal power ban',
        level: 14,
        price: 100000000,
        multipliers: {
            ppmPerYearMultiplier: 0.85
        },
        desc: 'Cut CO2 emissions by 15%.'
    }, {
        name: 'Gas cars ban',
        level: 15,
        price: 200000000,
        ban: ['Tree planter', 'Delimber', 'Harvester', 'Heavy delimber', 'Grapple'],
        multipliers: {
            ppmPerYearMultiplier: 0.85
        },
        desc: 'Cut CO2 emissions by 15%.'
    }, {
        name: 'Sanctuaries',
        level: 16,
        price: 200000000,
        multipliers: {
            ppmPerYearMultiplier: 0.9,
            chop: 0.4,
            clickChop: 0.4
        },
        desc: 'National Parks are not enough: entire parts of the world are sanctuarized, for Nature to find a new balance. Cut CO2 emissions by 10%. Decrease click and workers chopping rate by 60%.'
    }];

}());









/*global bloom*/

(function () {
    'use strict';

    var definitions = bloom.ns('game.definitions');

    definitions.workers = [{
        name: 'Florist',
        max: 400,
        price: 50,
        increase: 1.025,
        yields: 1,
        level: 0,
        yieldsGold: 0,
        desc: 'Florists like nature. Incidentally, [yields] will grow every week.'
    }, {
        name: 'Gatherer',
        max: 400,
        price: 50,
        increase: 1.025,
        yields: 0,
        level: 0,
        chop: 1,
        yieldsGold: 0,
        desc: 'These guys visit the forest and gather firewood. [chop] is chopped every week.'
    }, {
        name: 'Arborist',
        max: 300,
        price: 500,
        increase: 1.028,
        yields: 7,
        chop: 1,
        level: 1,
        yieldsGold: 0,
        desc: 'Arborists manage your forest: they plant [yields] and chop [chop] every week.'
    }, {
        name: 'Activist',
        max: 300,
        price: 500,
        increase: 1.028,
        yields: 1,
        level: 1,
        yieldsGold: 6,
        desc: 'Activists help raise money for your organization. Each raise [yieldsGold] per week. They also plant trees from time to time ([yields] per week).'
    }, {
        name: 'Forester',
        max: 200,
        price: 4000,
        increase: 1.034,
        yields: 100,
        level: 2,
        yieldsGold: 0,
        desc: 'Foresters plant [yields] every week.'
    }, {
        name: 'Lumberjack',
        max: 200,
        price: 4000,
        increase: 1.034,
        yields: 0,
        level: 2,
        chop: 100,
        yieldsGold: 0,
        desc: 'Lumberjacks are professionals who chop [chop] every week.'
    }, {
        name: 'Ranger',
        max: 150,
        price: 20000,
        increase: 1.04,
        yields: 600,
        level: 3,
        yieldsGold: 0,
        desc: 'Rangers plant [yields] every week.'
    }, {
        name: 'Advocate',
        max: 150,
        price: 30000,
        increase: 1.04,
        yields: 0,
        level: 3,
        chop: 0,
        yieldsGold: 400,
        desc: 'Advocates are more powerfull than activists: they raise [yieldsGold] per week!'
    }, {
        name: 'District Ranger',
        max: 100,
        price: 100000,
        increase: 1.055,
        yields: 3500,
        level: 4,
        yieldsGold: 0,
        desc: 'District Rangers plant [yields] every week.'
    }, {
        name: 'Delimber',
        max: 100,
        price: 100000,
        increase: 1.055,
        yields: 0,
        level: 4,
        chop: 3500,
        yieldsGold: 0,
        desc: 'Delimbers are light harvesting vehicules that chop [chop] per week.'
    }, {
        name: 'Tree planter',
        max: 75,
        price: 400000,
        increase: 1.06,
        yields: 20000,
        level: 5,
        yieldsGold: 0,
        desc: 'Planting machine! They plant [yields] per week.'
    }, {
        name: 'Harvester',
        max: 75,
        price: 400000,
        increase: 1.06,
        yields: 0,
        level: 5,
        chop: 20000,
        yieldsGold: 0,
        desc: 'Harvesters chop [chop] per week.'
    }, {
        name: 'Helicopter',
        max: 50,
        price: 1000000,
        increase: 1.07,
        yields: 100000,
        level: 6,
        yieldsGold: 0,
        desc: 'Aerial seeding is very efficient: helicopters plant [yields] per week!'
    }, {
        name: 'Heavy delimber',
        max: 50,
        price: 1000000,
        increase: 1.07,
        yields: 0,
        level: 6,
        chop: 80000,
        yieldsGold: 0,
        desc: 'Heavy delimbers are a lot better than delimbers: they chop [chop] per week.'
    }, {
        name: 'Plane',
        max: 25,
        price: 4000000,
        increase: 1.13,
        yields: 500000,
        level: 7,
        yieldsGold: 0,
        desc: 'Aerial seeding is very efficient: [yields] per week are planted!',
        type: 'plane'
    }, {
        name: 'Grapple',
        max: 50,
        price: 2000000,
        increase: 1.09,
        yields: 0,
        chop: 250000,
        level: 7,
        yieldsGold: 0,
        desc: 'Grapples are powerful machines that chop [chop] per week.'
    }];

}());