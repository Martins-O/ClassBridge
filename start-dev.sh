#!/usr/bin/env bash
# ClassBridge Development Startup Script
# Supports mobile device access via network binding

set -euo pipefail

# --- Colors & Styles ---
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# --- Configuration ---
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_PORT=3000
BACKEND_PORT=4000

# --- Helper Functions ---
log_info() { echo -e "${CYAN}${BOLD}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}${BOLD}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}${BOLD}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}${BOLD}[ERROR]${NC} $1"; }

get_local_ip() {
    local ip=""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ip=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
    else
        ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
    fi
    echo "$ip"
}

print_banner() {
    echo -e "${MAGENTA}${BOLD}"
    echo '  ____ _               ____  _     _     _             '
    echo ' / ___| | __ _ ___ ___| __ )| |__ (_) __| | __ _  ___ '
    echo '| |   | |/ _` / __/ __|  _ \| '"'"'_ \| |/ _` |/ _` |/ _ \'
    echo '| |___| | (_| \__ \__ \ |_) | | | | | (_| | (_| |  __/'
    echo ' \____|_|\__,_|___/___/____/|_| |_|_|\__,_|\__, |\___|'
    echo '                                           |___/       '
    echo -e "         ${CYAN}Development Environment Manager${NC}"
    echo
}

check_port() {
    local port=$1
    if command -v lsof >/dev/null ; then
        if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null ; then
            log_error "Port $port is already in use. Please free it and try again."
            exit 1
        fi
    fi
}

cleanup() {
    echo
    log_info "Shutting down development servers..."
    if [[ -n "${FRONTEND_PID:-}" ]]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
        log_info "Stopped Frontend (PID $FRONTEND_PID)"
    fi
    if [[ -n "${BACKEND_PID:-}" ]]; then
        kill "$BACKEND_PID" 2>/dev/null || true
        log_info "Stopped Backend (PID $BACKEND_PID)"
    fi
    log_success "Cleanup complete. See you next time!"
    exit 0
}

# --- Initialization ---
clear
print_banner
trap cleanup INT TERM EXIT

# Check directories
if [[ ! -d "$FRONTEND_DIR" ]] || [[ ! -d "$BACKEND_DIR" ]]; then
    log_error "Frontend or Backend directories missing. Check your project structure."
    exit 1
fi

# Port Validation
log_info "Checking port availability..."
check_port "$BACKEND_PORT"
check_port "$FRONTEND_PORT"

# Dependency Checks
ensure_dependencies() {
    local dir="$1"
    local name="$2"
    if [[ ! -d "$dir/node_modules" ]]; then
        log_warn "Dependencies missing in $name. Running npm install..."
        npm --prefix "$dir" install
        log_success "$name dependencies installed."
    else
        log_info "$name dependencies verified."
    fi
}

# Env Check
check_env() {
    local dir="$1"
    local name="$2"
    if [[ ! -f "$dir/.env" ]] && [[ -f "$dir/.env.example" ]]; then
        log_warn "$name .env file missing! Copying from .env.example..."
        cp "$dir/.env.example" "$dir/.env"
        log_warn "Please review $dir/.env and add your secrets."
    fi
}

check_env "$BACKEND_DIR" "Backend"
check_env "$FRONTEND_DIR" "Frontend"
ensure_dependencies "$BACKEND_DIR" "Backend"
ensure_dependencies "$FRONTEND_DIR" "Frontend"

# --- Get Local IP for Mobile Access ---
LOCAL_IP=$(get_local_ip)

# --- Execution ---
log_info "Starting ClassBridge services..."

# Start Backend with line buffering for logs
stdbuf -oL -eL npm --prefix "$BACKEND_DIR" run dev 2>&1 | stdbuf -oL -eL sed "s/^/${MAGENTA}[BACKEND]${NC} /" &
BACKEND_PID=$!
log_success "Backend process started (PID $BACKEND_PID)"

# Wait for backend to potentially start up
sleep 2

# Start Frontend with --host flag for mobile access
stdbuf -oL -eL npm --prefix "$FRONTEND_DIR" run dev -- --host 2>&1 | stdbuf -oL -eL sed "s/^/${CYAN}[FRONTEND]${NC} /" &
FRONTEND_PID=$!
log_success "Frontend process started (PID $FRONTEND_PID)"

echo
log_info "Frontend: http://localhost:$FRONTEND_PORT"
log_info "Backend:  http://localhost:$BACKEND_PORT"
echo

if [[ -n "$LOCAL_IP" ]]; then
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}  MOBILE ACCESS${NC}"
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo
    echo "  Access on your mobile device at:"
    echo
    echo -e "  ${CYAN}Frontend:${NC}  http://${LOCAL_IP}:$FRONTEND_PORT"
    echo -e "  ${CYAN}Backend:${NC}   http://${LOCAL_IP}:$BACKEND_PORT"
    echo
    echo -e "  ${YELLOW}Make sure your mobile is on the same WiFi network!${NC}"
    echo
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
else
    echo -e "${YELLOW}${BOLD}[WARN]${NC} Could not detect local IP address."
    echo "  To access from mobile, run 'ipconfig' or 'ifconfig' and use the shown IP."
    echo
fi

echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo

wait -n
