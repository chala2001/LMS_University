# 📚 Documentation Index

Reference documentation for the **Digital Education & Collaboration Platform (DECP)**.
Start with the [project README](../README.md) for an overview, then dive in here.

| Document | What it covers |
|----------|----------------|
| [backend.md](backend.md) | Spring Boot architecture, feature packages, REST endpoints, JPA entities |
| [frontend.md](frontend.md) | React + Vite structure, routing, auth context, API client |
| [docker.md](docker.md) | Dockerfiles, multi-stage builds, `docker-compose.yml` walkthrough |
| [security.md](security.md) | JWT flow, Spring Security config, CORS, BCrypt, RBAC, common attack mitigations |

## ☸️ Kubernetes

Kubernetes manifests and their documentation live in the extended companion
repository, **[LMS_FullStack_K8s_Deployment](https://github.com/chala2001/LMS_FullStack_K8s_Deployment)**:

| Guide | Topic |
|-------|-------|
| `docs/kubernetes/00-deployment-guide.md` | End-to-end deployment guide |
| `docs/kubernetes/01-architecture.md` | Cluster architecture |
| `docs/kubernetes/02-docker-to-k8s.md` | Translating Compose into K8s objects |
| `docs/kubernetes/03-database.md` | MySQL StatefulSet, PV/PVC, Secrets |
| `docs/kubernetes/04-backend.md` | Backend Deployment, Service, ConfigMap, probes |
| `docs/kubernetes/05-frontend.md` | Frontend Deployment, Nginx, Service exposure |
| `docs/kubernetes/06-running-the-cluster.md` | Running, scaling and debugging the cluster |

## 🧪 Scripts

PowerShell smoke tests for the REST API live in [`../scripts/`](../scripts/).
