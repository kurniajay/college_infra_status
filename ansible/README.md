# Ansible Automation

## Inventory
- inventory.ini

## Playbooks
- install_docker.yml
- install_k8s_tools.yml
- deploy.yml

## Usage
1) Install Docker:
   ansible-playbook ansible/install_docker.yml -i ansible/inventory.ini

2) Install Kubernetes tools:
   ansible-playbook ansible/install_k8s_tools.yml -i ansible/inventory.ini

3) Start minikube (manual):
   minikube start

4) Deploy application:
   ansible-playbook ansible/deploy.yml -i ansible/inventory.ini
