    // =============================
        // VARIÁVEIS GLOBAIS
        // =============================

        let currentUser = localStorage.getItem("currentUser");
        let bills = [];

        // =============================
        // SALVAR DADOS
        // =============================

        function save() {
            if (!currentUser) return;
            localStorage.setItem("bills_" + currentUser, JSON.stringify(bills));
        }


        // =============================
        // ADICIONAR CONTA
        // =============================

        function addBill() {
            const nameInput = document.getElementById("billName");
            const valueInput = document.getElementById("billValue");
            const monthInput = document.getElementById("billMonth");

            const name = nameInput.value.trim();
            const value = parseFloat(valueInput.value);
            const month = monthInput.value;

            if (!name || !value || !month) return;

            bills.push({ name, value, month, paid: false });
            save();
            render();

            nameInput.value = "";
            valueInput.value = "";
            nameInput.focus();
        }


        // =============================
        // RENDERIZAÇÃO
        // =============================

        function render() {
            const board = document.getElementById("board");
            if (!board) return;

            board.innerHTML = "";

            const months = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];

            let monthTotals = {};

            // Calcular totais por mês
            months.forEach(month => {
                monthTotals[month] = bills
                    .filter(bill => bill.month === month)
                    .reduce((acc, bill) => acc + bill.value, 0);
            });

            // Descobrir mês mais caro
            const highestMonth = Object.keys(monthTotals).reduce((a, b) =>
                monthTotals[a] > monthTotals[b] ? a : b
            );

            // Criar colunas
            months.forEach(month => {

                const column = document.createElement("div");
                column.classList.add("column");

                if (month === highestMonth && monthTotals[month] > 0) {
                    column.style.border = "2px solid #ff4d6d";
                }

                const title = document.createElement("h3");
                title.textContent = month;

                const list = document.createElement("ul");

                bills.forEach((bill, index) => {
                    if (bill.month !== month) return;

                    const li = document.createElement("li");
                    li.draggable = true;

                    li.innerHTML = `
                ${getEmoji(bill.name)} ${bill.name} - R$ ${bill.value.toFixed(2)}
                <button class="delete">✕</button>
            `;

                    if (bill.paid) li.classList.add("paid");

                    li.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", index);
                    });

                    li.addEventListener("click", (e) => {
                        if (e.target.classList.contains("delete")) return;
                        bill.paid = !bill.paid;
                        save();
                        render();
                    });

                    li.querySelector(".delete").addEventListener("click", () => {
                        bills.splice(index, 1);
                        save();
                        render();
                    });

                    list.appendChild(li);
                });

                const totalDiv = document.createElement("div");
                totalDiv.classList.add("column-total");
                totalDiv.textContent = `Total: R$ ${monthTotals[month].toFixed(2)}`;

                column.appendChild(title);
                column.appendChild(list);
                column.appendChild(totalDiv);

                // Drag & Drop
                column.addEventListener("dragover", (e) => e.preventDefault());

                column.addEventListener("drop", (e) => {
                    e.preventDefault();
                    const draggedIndex = e.dataTransfer.getData("text/plain");
                    bills[draggedIndex].month = month;
                    save();
                    render();
                });

                board.appendChild(column);
            });

            // Total anual
            let annualTotal = bills.reduce((acc, b) => acc + b.value, 0);

            const summary = document.getElementById("yearSummary");
            if (summary) {
                summary.textContent = `💰 Total Anual: R$ ${annualTotal.toFixed(2)}`;
            }

            // Atualizar gráfico se existir
            if (typeof updateChart === "function") {
                updateChart(monthTotals);
            }
        }


        // =============================
        // EMOJIS
        // =============================

        function getEmoji(name) {
            const text = name.toLowerCase();

            if (text.includes("aluguel")) return "🏠";
            if (text.includes("internet")) return "🌐";
            if (text.includes("luz")) return "💡";
            if (text.includes("agua") || text.includes("água")) return "🚰";
            if (text.includes("cartao") || text.includes("cartão")) return "💳";
            if (text.includes("mercado")) return "🛒";
            if (text.includes("faculdade")) return "🎓";
            if (text.includes("netflix")) return "🎬";

            return "💸";
        }


        // =============================
        // SISTEMA DE LOGIN
        // =============================

        function register() {
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const message = document.getElementById("authMessage");

            if (!username || !password) {
                message.textContent = "Preencha usuário e senha";
                return;
            }

            let users = JSON.parse(localStorage.getItem("users")) || {};

            if (users[username]) {
                message.textContent = "Usuário já existe";
                return;
            }

            users[username] = { password };
            localStorage.setItem("users", JSON.stringify(users));

            message.textContent = "Usuário cadastrado! Faça login.";
        }


        function login() {
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const message = document.getElementById("authMessage");

            let users = JSON.parse(localStorage.getItem("users")) || {};

            if (!users[username] || users[username].password !== password) {
                message.textContent = "Usuário ou senha inválidos";
                return;
            }

            localStorage.setItem("currentUser", username);
            currentUser = username;
            showApp();
        }


        function logout() {
            localStorage.removeItem("currentUser");
            location.reload();
        }


        function showApp() {
            document.getElementById("authContainer").style.display = "none";
            document.getElementById("appContainer").style.display = "block";

            // Mostrar nome do usuário
            document.getElementById("loggedUser").textContent =
                "👤 Logado como: " + currentUser;

            // Carregar contas do usuário
            bills = JSON.parse(localStorage.getItem("bills_" + currentUser)) || [];

            render();
        }