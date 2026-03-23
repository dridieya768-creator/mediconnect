# MediConnect — Commandes utiles

.PHONY: help install dev prod seed migrate down logs

help:
	@echo "MediConnect — Commandes disponibles:"
	@echo "  make install   - Installer les dépendances (backend + frontend)"
	@echo "  make dev       - Démarrer en mode développement (Docker)"
	@echo "  make seed      - Injecter les données de test"
	@echo "  make migrate   - Exécuter les migrations DB"
	@echo "  make prod      - Build de production"
	@echo "  make down      - Arrêter tous les services"
	@echo "  make logs      - Voir les logs"

install:
	cd backend && npm install
	cd frontend && npm install

dev:
	docker-compose up -d postgres redis minio
	@echo "✅ Services DB démarrés"
	@echo "🔧 Backend:  cd backend && npm run start:dev"
	@echo "🎨 Frontend: cd frontend && npm start"

dev-docker:
	docker-compose up -d

seed:
	cd backend && npm run seed

migrate:
	cd backend && npm run migration:run

prod:
	docker-compose up -d --build

down:
	docker-compose down

logs:
	docker-compose logs -f backend frontend
