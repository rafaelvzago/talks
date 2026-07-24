# TDC 2026 — OpenShift Service Mesh multi-cluster flow

Interactive diagram for the OpenShift Service Mesh 3 multi-cluster request path (shared trust, remote discovery, east-west gateways, one Istio mesh ID).

**Sourced from:** [rafaelvzago/acm-ossm-flow](https://github.com/rafaelvzago/acm-ossm-flow) `flow/` (vendored copy; not a submodule).  
**Served at:** `/tdc/2026/acm-ossm/` on [talks.rafaelvzago.com](https://talks.rafaelvzago.com)  
**Hub / custom domain:** [ossm.rafaelvzago.com](https://ossm.rafaelvzago.com) → chooser for `/mtls/` (primer) and `/flow/` (animation)  
**Author:** Rafael Zago · Senior Software Automation Engineer · Red Hat

## Develop

```bash
npm ci
npm run dev
# open http://localhost:3000/tdc/2026/acm-ossm/
```

## Static export

```bash
npm run build:pages
npm test
```

## License

Apache 2.0
