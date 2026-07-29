# OurHome on Kubernetes — OCI (OKE) manifests

Targets OCI's Kubernetes Engine (OKE) specifically — see `deploy/oci/` at the
repo root for the Terraform that provisions the cluster/registry these
manifests deploy into, and `deploy/oci/README.md` for the full runbook. These
manifests are still a **starting point**, not production-hardened infra: no
autoscaling (HPA), no service mesh, no NetworkPolicies restricting east-west
traffic, no PodDisruptionBudgets, no TLS, no external secrets manager. Add
those when you actually need them — see `ARCHITECTURE.md` at the repo root
for the reasoning.

## Apply order

```
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml       # don't apply the committed template as-is — see below
kubectl apply -f configmap.yaml
kubectl apply -f postgres.yaml
kubectl apply -f auth-service.yaml -f properties-service.yaml -f appointments-service.yaml \
               -f inquiries-service.yaml -f favorites-service.yaml -f support-service.yaml \
               -f chat-service.yaml
kubectl apply -f gateway.yaml
```

No Ingress resource — `gateway.yaml`'s Service is `type: LoadBalancer`, which
on OKE provisions a real OCI Load Balancer directly via the cluster's built-in
Cloud Controller Manager. There's exactly one public entry point and one path
(the gateway already does all internal routing), so an Ingress controller
would be solving a problem this app doesn't have. If you ever need
multi-host/path routing at the edge (a second app sharing the cluster, custom
domains per environment), that's the point to introduce `ingress-nginx` and a
real `Ingress` resource — not before.

## Secrets

`secret.yaml` is a **committed template** with placeholder values — never
apply it as-is. Generate the real one imperatively instead, so nothing
sensitive ever touches git:

```
kubectl create secret generic ourhome-secrets -n ourhome \
  --from-literal=DATABASE_URL="postgresql://ourhome:<real-password>@postgres:5432/ourhome" \
  --from-literal=JWT_SECRET="<random 64+ char string>" \
  --from-literal=INTERNAL_SERVICE_TOKEN="<random string>" \
  --from-literal=POSTGRES_PASSWORD="<real-password>"
```

## Images

Every manifest references a placeholder image path:
`<OCIR_REGION>.ocir.io/<OCIR_NAMESPACE>/ourhome/<service-name>:latest`.
`deploy/oci/README.md` has the exact substitution command and the
`build-and-push.sh` script that builds and pushes all 8 to OCIR.

## chat-service replicas

`chat-service` is pinned to `replicas: 1` on purpose — its SSE client list and
typing state are in-process memory (see `services/chat-service/src/realtime.ts`).
Scaling it past 1 replica will silently break chat for anyone whose
connection lands on a different pod. Don't bump this without adding a shared
pub/sub (Redis) first.
