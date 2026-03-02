// components/ui/wireframe-dotted-globe.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function RotatingEarth({
  width = 360,
  height = 360,
  className = "",
  primaryColor = "rgb(52, 46, 229)", // Vokely primary
}) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const containerWidth = width;
    const containerHeight = height;
    const radius = Math.min(containerWidth, containerHeight) / 2.2;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(context);

    const pointInPolygon = (point, polygon) => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    const pointInFeature = (point, feature) => {
      const geometry = feature.geometry;
      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates;
        if (!pointInPolygon(point, coordinates[0])) return false;
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false;
        }
        return true;
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false;
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) return true;
          }
        }
        return false;
      }
      return false;
    };

    const generateDotsInPolygon = (feature, dotSpacing = 16) => {
      const dots = [];
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;

      const stepSize = dotSpacing * 0.08;

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point = [lng, lat];
          if (pointInFeature(point, feature)) {
            dots.push(point);
          }
        }
      }

      return dots;
    };

    const allDots = [];
    let landFeatures;

    // Connection pairs (lng, lat) between regions
    const connectionsRaw = [
      // US (SF) -> EU (London)
      { from: [-122.4194, 37.7749], to: [0.1276, 51.5074] },
      // EU (Berlin) -> India (Bangalore)
      { from: [13.405, 52.52], to: [77.5946, 12.9716] },
      // India (Bangalore) -> APAC (Singapore)
      { from: [77.5946, 12.9716], to: [103.8198, 1.3521] },
      // US (NY) -> South America (São Paulo)
      { from: [-74.006, 40.7128], to: [-46.6333, -23.5505] },
      // EU (Paris) -> Middle East (Dubai)
      { from: [2.3522, 48.8566], to: [55.2708, 25.2048] },
    ];

    // Enhance connections with interpolators & offsets for animation variety
    const connections = connectionsRaw.map((c, index) => ({
      ...c,
      interpolate: d3.geoInterpolate(c.from, c.to),
      offset: index * 0.35, // phase offset per connection
    }));

    // Animation time (seconds)
    let animationTime = 0;

    const drawStaticArc = (from, to, scaleFactor) => {
      const interpolate = d3.geoInterpolate(from, to);
      const steps = 80;

      context.beginPath();

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const [lng, lat] = interpolate(t);
        const projected = projection([lng, lat]);
        if (!projected) continue;
        const [x, y] = projected;

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.strokeStyle = "rgba(239, 246, 255, 0.85)"; // very light arc
      context.lineWidth = 1.1 * scaleFactor;
      context.setLineDash([4 * scaleFactor, 5 * scaleFactor]); // dotted
      context.globalAlpha = 0.9;
      context.stroke();
      context.setLineDash([]);
      context.globalAlpha = 1;
    };

    const drawMovingDotOnArc = (connection, scaleFactor) => {
      const { interpolate, offset } = connection;

      // dotSpeed = how many cycles per second along the arc
      const dotSpeed = 0.3;
      const t = (animationTime * dotSpeed + offset) % 1;

      const [lng, lat] = interpolate(t);
      const projected = projection([lng, lat]);
      if (!projected) return;
      const [x, y] = projected;

      context.beginPath();
      context.arc(x, y, 2.1 * scaleFactor, 0, 2 * Math.PI);
      context.fillStyle = "rgba(239, 246, 255, 0.98)"; // almost white
      context.fill();

      // subtle glow
      context.beginPath();
      context.arc(x, y, 4 * scaleFactor, 0, 2 * Math.PI);
      context.fillStyle = "rgba(219, 234, 254, 0.45)"; // soft indigo glow
      context.fill();
    };

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight);

      const currentScale = projection.scale();
      const scaleFactor = currentScale / radius;

      // Globe background – primary brand color
      context.beginPath();
      context.arc(
        containerWidth / 2,
        containerHeight / 2,
        currentScale,
        0,
        2 * Math.PI
      );
      context.fillStyle = primaryColor;
      context.fill();

      // Outer stroke
      context.strokeStyle = "#EEF2FF";
      context.lineWidth = 2 * scaleFactor;
      context.stroke();

      if (landFeatures) {
        // Graticule
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule());
        context.strokeStyle = "#E0E7FF";
        context.lineWidth = 0.7 * scaleFactor;
        context.globalAlpha = 0.7;
        context.stroke();
        context.globalAlpha = 1;

        // Land outlines
        context.beginPath();
        landFeatures.features.forEach((feature) => {
          path(feature);
        });
        context.strokeStyle = "#EEF2FF";
        context.lineWidth = 0.7 * scaleFactor;
        context.stroke();

        // Land dots (halftone)
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat]);
          if (!projected) return;
          const [x, y] = projected;
          context.beginPath();
          context.arc(x, y, 1.05 * scaleFactor, 0, 2 * Math.PI);
          context.fillStyle = "#C7D2FE"; // indigo-200 style
          context.fill();
        });

        // Static arcs
        connections.forEach(({ from, to }) => {
          drawStaticArc(from, to, scaleFactor);
        });

        // Moving dots along arcs
        connections.forEach((conn) => {
          drawMovingDotOnArc(conn, scaleFactor);
        });
      }
    };

    const loadWorldData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
        );
        if (!response.ok) throw new Error("Failed to load land data");

        landFeatures = await response.json();

        landFeatures.features.forEach((feature) => {
          const dots = generateDotsInPolygon(feature, 18);
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat });
          });
        });

        render();
      } catch (err) {
        console.error(err);
        setError("Failed to load Earth data");
      }
    };

    const rotation = [0, 0];
    let autoRotate = true;
    const rotationSpeed = 0.35; // degrees per frame-ish

    const rotate = (elapsed) => {
      // elapsed is ms since timer started
      animationTime = elapsed / 1000; // seconds

      if (autoRotate) {
        rotation[0] += rotationSpeed * 0.3; // slightly slower, smoother
        projection.rotate(rotation);
      }

      render();
    };

    const rotationTimer = d3.timer(rotate);

    const handleMouseDown = (event) => {
      autoRotate = false;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation = [...rotation];

      const handleMouseMove = (moveEvent) => {
        const sensitivity = 0.5;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = Math.max(
          -90,
          Math.min(90, startRotation[1] - dy * sensitivity)
        );

        projection.rotate(rotation);
        render();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        setTimeout(() => {
          autoRotate = true;
        }, 400);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleWheel = (event) => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(
        radius * 0.7,
        Math.min(radius * 2.5, projection.scale() * factor)
      );
      projection.scale(newScale);
      render();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    loadWorldData();

    return () => {
      rotationTimer.stop();
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [width, height, primaryColor]);

  if (error) {
    return (
      <div
        className={`flex h-[360px] w-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-center text-xs text-slate-500 ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-[360px] w-[360px] rounded-2xl bg-transparent"
      />
      <div className="hidden md:block pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-slate-100">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
