import { Vector2 } from 'three';

export const FinalShader = {
    uniforms: {
        tDiffuse: { value: null },
        uAb: { value: 0.0012 },
        uAspect: { value: 1 },
        uSun: { value: new Vector2(0.5, 0.5) },
        uSunVis: { value: 0 },
    },
    vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAb, uAspect, uSunVis;
    uniform vec2 uSun;
    varying vec2 vUv;
    float h21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
    }
    vec3 flare(vec2 uv, vec2 sp) {
    vec3 f = vec3(0.0);
    vec2 dir = vec2(0.5) - sp;

    for (int i = 0; i < 7; i++) {
        float fi = float(i);
        float t = 0.35 + fi * 0.3;
        vec2 gp = sp + dir * t;
        float size = 0.018 + 0.05 * fract(fi * 0.618 + 0.2);
        float d = length((uv - gp) * vec2(uAspect, 1.0));
        float disc = (1.0 - smoothstep(size * 0.75, size, d)) * smoothstep(size * 0.2, size, d);
        f += disc * 0.045 * mix(vec3(0.25, 0.6, 1.0), vec3(1.0, 0.45, 0.25), fract(fi * 0.37 + 0.1));
    }

    vec2 dd = (uv - sp) * vec2(uAspect, 1.0);
    float r = length(dd);

    f += vec3(0.3, 0.55, 1.0) * 0.35 * exp(-abs(dd.y) * 110.0) * exp(-abs(dd.x) * 2.4);

    float halo = 1.0 - smoothstep(0.0, 0.025, abs(r - 0.36));
    f += vec3(1.0, 0.75, 0.5) * 0.035 * halo;

    float ang = r > 0.0 ? atan(dd.y, dd.x) : 0.0;
    float star = pow(max(0.0, 1.0 - r * 2.2), 3.0) * (0.6 + 0.4 * sin(ang * 14.0) * sin(ang * 5.0 + 1.0));
    f += vec3(1.0, 0.9, 0.75) * 0.10 * star;

    return f;
    }

    void main() {
    vec2 c = vUv - 0.5;
    float r2 = dot(c, c);
    vec2 off = c * uAb * (1.0 + 5.0 * r2);
    vec3 col = vec3(texture2D(tDiffuse, vUv + off).r,
                    texture2D(tDiffuse, vUv).g,
                    texture2D(tDiffuse, vUv - off).b);

    if (uSunVis > 0.0) {
        vec3 sc = texture2D(tDiffuse, uSun).rgb;
        float vis = uSunVis * smoothstep(1.5, 5.0, dot(sc, vec3(0.3, 0.6, 0.1)));
        col += flare(vUv, uSun) * vis;
    }

    col *= 1.0 - smoothstep(0.08, 0.75, r2) * 0.75;

    float grain = h21(gl_FragCoord.xy) - 0.5;
    col += vec3(grain * 0.025);

    gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }
`
};
