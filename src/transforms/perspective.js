/**
 A **Perspective** is a {{#crossLink "Transform"}}{{/crossLink}} that defines a perspective projection transform.

 ## Overview

 * {{#crossLink "Camera"}}Camera{{/crossLink}} components pair these with viewing transform components, such as
 {{#crossLink "Lookat"}}Lookat{{/crossLink}}, to define viewpoints on attached {{#crossLink "Entity"}}Entities{{/crossLink}}.
 * Alternatively, use {{#crossLink "Ortho"}}{{/crossLink}} if you need a orthographic projection.

 <img src="../../../assets/images/Perspective.png"></img>

 ## Examples

 * [Camera with perspective projection](../../examples/#transforms_camera_project_perspective)

 ## Usage

 ````Javascript
 new xeogl.Entity({

     camera: xeogl.Camera({

        view: new xeogl.Lookat({
            eye: [0, 0, -4],
            look: [0, 0, 0],
            up: [0, 1, 0]
        }),

        project: new xeogl.Perspective({
            fov: 50,
            near: 0.1,
            far: 1000
        })
     }),

     perspective: new xeogl.BoxGeometry()
 });
 ````

 @class Perspective
 @module xeogl
 @submodule transforms
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this Perspective within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Perspective.
 @param [cfg.parent] {String|Transform} ID or instance of a parent {{#crossLink "Transform"}}{{/crossLink}} within the same {{#crossLink "Scene"}}Scene{{/crossLink}}.
 @param [cfg.fov=50.0] {Number} Field-of-view angle, in degrees.
 @param [cfg.fovAxis="min"] {String} The field-of-view axis: "x", "y", or "min" to use whichever is currently the minimum.
 @param [cfg.near=0.1] {Number} Position of the near plane on the View-space Z-axis.
 @param [cfg.far=10000] {Number} Position of the far plane on the View-space Z-axis.
 @extends Transform
 */
(function () {

    "use strict";

    xeogl.Perspective = xeogl.Transform.extend({

        type: "xeogl.Perspective",

        _init: function (cfg) {

            this._super(cfg);

            this._dirty = false;
            this._fov = 50.0;
            this._near = 0.1;
            this._far = 10000.0;

            // Recompute aspect from change in canvas size
            this._canvasResized = this.scene.canvas.on("boundary", this._needUpdate, this);

            this.fov = cfg.fov;
            this.fovAxis = cfg.fovAxis;
            this.near = cfg.near;
            this.far = cfg.far;
        },

        _update: function () {

            var canvas = this.scene.canvas.canvas;
            var aspect = canvas.clientWidth / canvas.clientHeight;

            var fov = this._fov;
            var fovAxis = this._fovAxis;

            if (fovAxis == "x" || (fovAxis == "min" && aspect < 1) || (fovAxis == "max" && aspect > 1)) {
                fov = fov / aspect;
            }

            fov = Math.min(fov, 120);

            this.matrix = xeogl.math.perspectiveMat4(fov * (Math.PI / 180.0), aspect, this._near, this._far, this._matrix);
        },

        _props: {

            /**
             * The field-of-view angle (FOV).
             *
             * Fires a {{#crossLink "Perspective/fov:event"}}{{/crossLink}} event on change.
             *
             * @property fov
             * @default 50.0
             * @type Number
             */
            fov: {

                set: function (value) {

                    this._fov = (value !== undefined && value !== null) ? value : 50.0;

                    this._renderer.imageDirty = true;

                    this._needUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Perspective's {{#crossLink "Perspective/fov:property"}}{{/crossLink}} property changes.
                     *
                     * @event fov
                     * @param value The property's new value
                     */
                    this.fire("fov", this._fov);
                },

                get: function () {
                    return this._fov;
                }
            },

            /**
             * The FOV axis.
             *
             * Options are "x", "y" or "min", to use the minimum axis.
             *
             * Fires a {{#crossLink "Perspective/fov:event"}}{{/crossLink}} event on change.
             *
             * @property fov
             * @default "min"
             * @type String
             */
            fovAxis: {

                set: function (value) {

                    value = value || "min";

                    if (this._fovAxis === value) {
                        return;
                    }

                    if (value !== "x" && value !== "y" && value !== "min") {
                        this.error("Unsupported value for 'fovAxis': " + value + " - defaulting to 'min'");
                        value = "min";
                    }

                    this._fovAxis = value;

                    this._renderer.imageDirty = true;

                    this._needUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Perspective's {{#crossLink "Perspective/fovAxis:property"}}{{/crossLink}} property changes.
                     *
                     * @event fovAxis
                     * @param value The property's new value
                     */
                    this.fire("fovAxis", this._fovAxis);
                },

                get: function () {
                    return this._fovAxis;
                }
            },

            /**
             * Position of this Perspective's near plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "Perspective/near:event"}}{{/crossLink}} event on change.
             *
             * @property near
             * @default 0.1
             * @type Number
             */
            near: {

                set: function (value) {

                    this._near = (value !== undefined && value !== null) ? value : 0.1;

                    this._renderer.imageDirty = true;

                    this._needUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Perspective's   {{#crossLink "Perspective/near:property"}}{{/crossLink}} property changes.
                     * @event near
                     * @param value The property's new value
                     */
                    this.fire("near", this._near);
                },

                get: function () {
                    return this._near;
                }
            },

            /**
             * Position of this Perspective's far plane on the positive View-space Z-axis.
             *
             * Fires a {{#crossLink "Perspective/far:event"}}{{/crossLink}} event on change.
             *
             * @property far
             * @default 10000.0
             * @type Number
             */
            far: {

                set: function (value) {

                    this._far = (value !== undefined && value !== null) ? value : 10000;

                    this._renderer.imageDirty = true;

                    this._needUpdate(0); // Ensure matrix built on next "tick"

                    /**
                     * Fired whenever this Perspective's  {{#crossLink "Perspective/far:property"}}{{/crossLink}} property changes.
                     *
                     * @event far
                     * @param value The property's new value
                     */
                    this.fire("far", this._far);
                },

                get: function () {
                    return this._far;
                }
            }
        },

        _getJSON: function () {
            var json = {
                fov: this._fov,
                fovAxis: this._fovAxis,
                near: this._near,
                far: this._far
            };
            if (this._parent) {
                json.parent = this._parent.id;
            }
            return json;
        },

        _destroy: function () {

            this._super();

            this.scene.canvas.off(this._canvasResized);
        }
    });

})();
