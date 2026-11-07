
let medicines = [];

async function loadMedicines() {
    try {
        const response = await fetch("http://127.0.0.1:5000/medicines");

        if (!response.ok) {
            throw new Error("Не удалось загрузить лекарства");
        }

        medicines = await response.json();
        console.log("Лекарства загружены:", medicines);

    } catch (error) {
        console.error("Ошибка:", error);
        document.getElementById("results").innerHTML =
            "<p>Не удалось подключиться к серверу. Проверь, запущен ли Python.</p>";
    }
}

async function searchMedicine() {
    if (medicines.length === 0) {
        await loadMedicines();
    }

    const input = document.getElementById("medicineInput").value.trim().toLowerCase();
    const results = document.getElementById("results");

    if (!input) {
        results.innerHTML = "<p>Введите название лекарства.</p>";
        return;
    }

    const found = medicines.filter(m =>
        m.name.toLowerCase().includes(input)
    );
    // Очищаем старые отметки аптек
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Показываем найденные аптеки на карте
    found.forEach(medicine => {
        const pharmacy = pharmacies.find(
            p => p.name === medicine.pharmacy
        );

        if (pharmacy) {
            L.marker([pharmacy.lat, pharmacy.lng])
                .addTo(map)
                .bindPopup(`<b>${medicine.pharmacy}</b><br>${medicine.name}`);
        }
    });

    if (found.length === 0) {
        results.innerHTML = "<p>Лекарство не найдено.</p>";
        return;
    }

    const minPrice = Math.min(...found.map(m => m.price));


    results.innerHTML = found.map(m => `
    <div class="medicine-card">
        <div class="medicine-icon">✚</div>

        <div class="medicine-info">
            <span class="medicine-category">ПРЕДЛОЖЕНИЕ АПТЕКИ</span>
            <h3>${m.name}</h3>
            <p>${m.pharmacy}</p>
            <small>📍 ${m.address}</small>
        </div>

        <div class="medicine-price">
            <strong>${m.price} сом</strong>

            ${m.price === minPrice
            ? '<span class="best-price">★ Лучшая цена</span>'
            : '<span class="availability">В наличии*</span>'
        }
        </div>
    </div>
`).join("");

}

loadMedicines();

// Создаём карту Бишкека
const map = L.map("map").setView([42.8746, 74.5698], 13);

// Загружаем карту OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Добавляем аптеки
const pharmacies = [
    {
        name: "Аптека №1",
        address: "Бишкек, проспект Чуй",
        lat: 42.8755,
        lng: 74.5850
    },
    {
        name: "Аптека №2",
        address: "Бишкек, улица Киевская",
        lat: 42.8730,
        lng: 74.5900
    },
    {
        name: "Аптека №3",
        address: "Бишкек, улица Манаса",
        lat: 42.8700,
        lng: 74.5800
    }
];

// Показываем отметки на карте
pharmacies.forEach(pharmacy => {
    L.marker([pharmacy.lat, pharmacy.lng])
        .addTo(map)
        .bindPopup(
            `<b>${pharmacy.name}</b><br>${pharmacy.address}`
        );
});
function showAllPharmacies() {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    pharmacies.forEach(pharmacy => {
        L.marker([pharmacy.lat, pharmacy.lng])
            .addTo(map)
            .bindPopup(
                `<b>${pharmacy.name}</b><br>${pharmacy.address}`
            );
    });

    map.setView([42.8746, 74.5698], 13);
}
function findMyLocation() {
    if (!navigator.geolocation) {
        alert("Твой браузер не поддерживает геолокацию.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Показываем пользователя на карте
            L.marker([userLat, userLng])
                .addTo(map)
                .bindPopup("Вы находитесь здесь!")
                .openPopup();

            map.setView([userLat, userLng], 14);

            // Рассчитываем расстояние до аптек
            function calculateDistance(lat1, lon1, lat2, lon2) {
                const R = 6371;
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;

                const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos(lat1 * Math.PI / 180) *
                    Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) ** 2;

                return R * 2 * Math.atan2(
                    Math.sqrt(a),
                    Math.sqrt(1 - a)
                );
            }

            const distances = pharmacies.map(pharmacy => {
                const distance = calculateDistance(
                    userLat,
                    userLng,
                    pharmacy.lat,
                    pharmacy.lng
                );

                return `
                    <p>${pharmacy.name}: ${distance.toFixed(2)} км</p>
                `;
            }).join("");

            document.getElementById("results").innerHTML +=
                `<h3>Расстояние до аптек:</h3>${distances}`;
        },

        error => {
            alert("Не удалось определить местоположение. Разреши доступ к геолокации.");
        }
    );
}
function sortByPrice() {
    medicines.sort((a, b) => a.price - b.price);
    searchMedicine();
}

function sortByPriceDescending() {
    medicines.sort((a, b) => b.price - a.price);
    searchMedicine();
}

// Переход к выбранной аптеке на карте
function focusPharmacy(pharmacyName) {
    const pharmacy = pharmacies.find(
        p => p.name === pharmacyName
    );

    if (!pharmacy) return;

    map.setView(
        [pharmacy.lat, pharmacy.lng],
        16,
        { animate: true }
    );

    L.popup()
        .setLatLng([pharmacy.lat, pharmacy.lng])
        .setContent(`
            <strong>${pharmacy.name}</strong><br>
            ${pharmacy.address}
        `)
        .openOn(map);
}

async function showCategory(category) {
    if (medicines.length === 0) {
        await loadMedicines();
    }

    const found = medicines.filter(
        medicine => medicine.category === category
    );

    const results = document.getElementById("results");

    if (found.length === 0) {
        results.innerHTML = "<p>В этой категории пока нет лекарств.</p>";
        return;
    }

    const minPrice = Math.min(...found.map(m => m.price));

    results.innerHTML = found.map(m => `
        <div class="medicine-card">
            <div class="medicine-icon">✚</div>

            <div class="medicine-info">
                <span class="medicine-category">${m.category}</span>
                <h3>${m.name}</h3>
                <p>${m.pharmacy}</p>
                <small>📍 ${m.address}</small>
            </div>

            <div class="medicine-price">
                <strong>${m.price} сом</strong>
                ${m.price === minPrice
            ? '<span class="best-price">★ Лучшая цена</span>'
            : '<span class="availability">В наличии*</span>'
        }
            </div>
        </div>
    `).join("");

    document.getElementById("pharmacies").scrollIntoView({
        behavior: "smooth"
    });
}
