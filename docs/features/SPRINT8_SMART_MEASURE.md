# Sprint 8 — Smart Measure (#139)

This first Sprint 8 vertical slice establishes the canonical `Property → Room → Window → Measurement Version` chain.

- A Window has a permanent human-readable code such as `LR-1` or `MB-2` within a property.
- Every save creates a new measurement version; earlier versions are never overwritten.
- Dimensions are stored as integer sixteenths of an inch plus their original whole/fraction inputs.
- The responsive form supports three-point width and height, depth, return, overlap, stack back, ceiling/sill/floor dimensions, handle projection, obstacles, mount type and control side.
- Owner may access all measure properties. Sales may access properties they created. Other roles are denied.
- Chinese and English labels are available in the measurement workspace.

Still tracked under #139 for later slices: photo uploads, annotated sketches, Bluetooth measuring-device adapters, signed/released workflow states, and assignment-aware Installer access.
