const ROOT = document.getElementById("site-root");
const PAGE = document.body.dataset.page || "home";

let uploads = [];
let renderedPdfs = [];

const youtubeVideos = {
  "0-02-05-0e3bcc38283e486b1e62cbc6c1ee06d15fdbdb0a59d511de591992d7a8d4e192_f6c8a18682fe0a7.mp4": "MScX02LepHo",
  "0-02-05-51a56697fc37d08e3a5f8d3547777e3406f0767d361a8669b8906d7d84ffbb88_46d17df1a6a3a7a8.mp4": "VY8fZTLkVws",
  "0-02-05-64fa666c0efa64c32db3089c87491c7f5364d7c1bbe9a18fbd7b7b00c6a6ddb6_1083a4ebf27f21a5.mp4": "iPKg7yAYOA0",
  "0-02-05-d78b2bc10969a9ee527e8b4f17301a67d35b8c0c67bffae766fab5122ffa24c4_3e523bd8aacf29c1.mp4": "YBa37JOTnTM",
};

const projectPages = [
  {
    id: "scratch",
    href: "/scratch/",
    nav: "Начален етап",
    short: "Scratch",
    title: "Коледна магия с код и въображение",
    icon: "fa-code",
    category: "Скрач",
  },
  {
    id: "water-resources",
    href: "/water-resources/",
    nav: "Водата - извор на живот",
    short: "Водата",
    title: "Водата: Изследване, отговорност и опазване",
    icon: "fa-water",
    category: "Води",
  },
  {
    id: "forest-fires",
    href: "/forest-fires/",
    nav: "Горски пожари",
    short: "Гори",
    title: "Горите - зеленото сърце на Сливен. Причини, последствия и мерки.",
    icon: "fa-fire-flame-curved",
    category: "Гори",
  },
  {
    id: "healthy-eating",
    href: "/healthy-eating/",
    nav: "Здравословно хранене",
    short: "Хранене",
    title: "Здравословно хранене: Насоки за ума, тялото и тонуса",
    icon: "fa-apple-whole",
    category: "Хранене",
  },
];

function shell(content) {
  ROOT.innerHTML = `${header()}<main>${content}</main>${footer()}${modal()}`;
  wireInteractions();
}

function header() {
  return `
    <header class="site-header">
      <div class="container header-content">
        <div>
          <a class="site-title" href="/">Иновации в действие</a>
          <p class="site-description">Интердисциплинарни дейности в ОУ „Панайот Хитов“ - гр. Сливен</p>
        </div>
        <div class="project-badge"><span>Национална програма</span><strong>„Иновации в действие“, Модул 1</strong></div>
      </div>
    </header>
    <nav class="main-navigation">
      <div class="container nav-wrap">
        <button class="menu-toggle" type="button" aria-expanded="false"><i class="fa-solid fa-bars"></i>Меню</button>
        <ul class="nav-menu">
          <li><a href="/"><i class="fa-solid fa-house"></i>Начало</a></li>
          <li><a href="/scratch/"><i class="fa-solid fa-code"></i>Начален етап</a></li>
          <li class="dropdown">
            <button class="dropdown-toggle" type="button"><i class="fa-solid fa-seedling"></i>Прогимназиален етап<i class="fa-solid fa-chevron-down"></i></button>
            <ul class="dropdown-menu">${projectPages.slice(1).map(page => `<li><a href="${page.href}"><i class="fa-solid ${page.icon}"></i>${page.nav}</a></li>`).join("")}</ul>
          </li>
          <li><a href="/gallery/"><i class="fa-solid fa-images"></i>Галерия и ресурси</a></li>
          <li><a href="/presentations/"><i class="fa-solid fa-chalkboard-teacher"></i>Презентации</a></li>
          <li><a href="/downloads/"><i class="fa-solid fa-download"></i>Материали</a></li>
          <li><a href="/contacts/"><i class="fa-solid fa-address-card"></i>Контакти</a></li>
        </ul>
      </div>
    </nav>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <section>
          <div class="footer-heading"><span class="leaf-badge"><i class="fa-solid fa-lightbulb"></i></span><div><strong class="footer-title">Иновации в действие</strong><em>Знанието няма граници, когато предметите се преплитат</em></div></div>
          <p>Проектно-базирано и интердисциплинарно обучение в начален и прогимназиален етап.</p>
          <div class="contact-card"><i class="fa-solid fa-school"></i><span>ОУ „Панайот Хитов“</span></div>
          <div class="contact-card"><i class="fa-solid fa-location-dot"></i><span>гр. Сливен, ул. Братя Кутеви 12А</span></div>
          <div class="contact-card"><i class="fa-solid fa-calendar-days"></i><span>2024-2026 учебна година</span></div>
        </section>
        <section><h3><i class="fa-solid fa-layer-group"></i>Модули</h3><ul class="footer-links">${projectPages.map(page => `<li><a href="${page.href}"><i class="fa-solid ${page.icon}"></i>${page.nav}</a></li>`).join("")}</ul></section>
        <section><h3><i class="fa-solid fa-folder-open"></i>Ресурси</h3><ul class="footer-links"><li><a href="/gallery/"><i class="fa-solid fa-images"></i>Галерия със снимки</a></li><li><a href="/presentations/"><i class="fa-solid fa-chalkboard-teacher"></i>Презентации</a></li><li><a href="/downloads/"><i class="fa-solid fa-download"></i>Материали за изтегляне</a></li><li><a href="/contacts/"><i class="fa-solid fa-address-card"></i>Контакти</a></li></ul></section>
        <section><h3><i class="fa-solid fa-circle-info"></i>Проектна информация</h3><div class="footer-stats"><span><strong>4</strong>Раздела</span><span><strong>${galleryFiles().length}</strong>Снимки</span><span><strong>${presentationFiles().length}</strong>Презентации</span><span><strong>${filesByExt(".mp4").length}</strong>Видео</span></div><div class="program-card"><i class="fa-solid fa-award"></i><p><strong>Национална програма</strong><br>„ИНОВАЦИИ В ДЕЙСТВИЕ“, Модул 1</p></div></section>
      </div>
      <div class="footer-bottom"><div class="container footer-bottom-content"><p>© 2026 ОУ „Панайот Хитов“ - Иновации в действие.</p><nav><a href="/">Начало</a><a href="/gallery/">Галерия</a><a href="/presentations/">Презентации</a><a href="/contacts/">Контакти</a></nav></div></div>
    </footer>`;
}

function hero(title, subtitle, icon, eyebrow = "") {
  return `<section class="page-header-section project-hero"><div class="container"><div class="page-header-content"><div class="page-icon"><i class="fa-solid ${icon}"></i></div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}<h1>${title}</h1><p class="page-description">${subtitle}</p><div class="page-breadcrumb"><a href="/">Начало</a><span>›</span><span>${title}</span></div></div></div></section>`;
}

function section(title, desc, body, alt = false, id = "") {
  return `<section ${id ? `id="${id}"` : ""} class="content-section overview-section ${alt ? "alt" : ""}"><div class="container"><header class="section-header reveal"><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ""}</header>${body}</div></section>`;
}

function homePage() {
  const cover = firstImage("Хранене") || firstImage("Води") || firstImage("Гори");
  shell(`
    <section class="hero-video-section project-home">
      <div class="video-background">${cover ? `<img class="hero-video" src="${assetUrl(cover)}" alt="">` : ""}<div class="video-overlay"></div></div>
      <div class="container hero-content stagger"><p class="eyebrow">Проект по Национална програма „Иновации в действие“, Модул 1</p><h1>Иновации в действие: Интердисциплинарни дейности в училище</h1><p>Добре дошли на официалната платформа, посветена на иновативните образователни практики в нашето училище.</p><div class="hero-stats">${stats()}</div></div>
    </section>
    ${section("Представяне на проекта и целите", "", `<div class="about-card reveal"><p>Чрез проектно-базирано и интердисциплинарно обучение учениците от начален и прогимназиален етап доказаха, че знанието няма граници, когато предметите се преплитат в името на реалния живот.</p><p>Тук ще откриете как теориите от учебниците по Математика, БЕЛ, Човекът и природата, КМИТ и Английски език се превръщат в софтуерни програми, екологични изследвания, брошури с кауза и здравословни рецепти.</p></div>`)}
    ${section("Структура на проекта", "Разделите следват изискванията от предоставения файл.", `<div class="topics-grid stagger">${projectPages.map(projectCard).join("")}</div>`, true)}
  `);
}

function stats() {
  return [["4", "Раздела"], [String(galleryFiles().length), "Снимки"], [String(presentationFiles().length), "Презентации"], [String(filesByExt(".mp4").length), "Видео"]].map(([n, label]) => `<div class="stat-item"><span class="stat-number">${n}</span><span>${label}</span></div>`).join("");
}

function projectCard(page) {
  const image = firstImage(page.category);
  return `<article class="topic-card project-card">${image ? `<img src="${assetUrl(image)}" alt="${page.nav}" loading="lazy">` : ""}<span class="round-icon"><i class="fa-solid ${page.icon}"></i></span><h3>${page.nav}</h3><p>${page.title}</p><a class="btn" href="${page.href}"><i class="fa-solid fa-arrow-right"></i>Разгледай</a></article>`;
}

function scratchPage() {
  shell(`${hero("Коледна магия с код и въображение", "КМ, Математика, БЕЛ, Английски език", "fa-code", "Начален етап - 4. клас")}
    ${section("Да разкажем истории със Скрач", "", `<div class="grid-2 reveal"><div class="white-card project-text"><p>По Коледа стават чудеса, а в 4. клас те се случиха пред екраните на компютрите. Малките програмисти създадоха вълшебни коледни истории, използвайки визуалната среда Scratch.</p><p><strong>БЕЛ и Английски език:</strong> учениците съчиниха сценарии, вдъхнаха живот на коледните герои и преведоха части от историите и репликите.</p><p><strong>Компютърно моделиране:</strong> разработиха алгоритми, за да накарат героите да се движат, говорят и взаимодействат.</p><p><strong>Математика:</strong> в сюжетите бяха вплетени забавни математически предизвикателства.</p></div>${imagePanel("Скрач")}</div>`)}
    ${resourceSection("Материали от Scratch проекта", "Скрач", true)}
    ${galleryPreview("Снимки от Scratch дейностите", "Скрач")}`);
}

function waterPage() {
  shell(`${hero("Водата: Изследване, отговорност и опазване", "Човекът и природата, Математика, КМИТ, БЕЛ, Английски език", "fa-water", "Прогимназиален етап - Тема 1")}
    ${section("Водата - извор на живот и отговорност на човека", "", `<div class="grid-2 reveal"><div class="white-card project-text"><p>Темата превърна учениците в млади учени и еколози. Работата премина през практическо проучване на местната екосистема и глобалните проблеми със замърсяването.</p><p><strong>Лабораторни изследвания:</strong> учениците взеха реални проби от Сливенските реки и чрез наблюдения и химични анализи изследваха какво съдържа водата.</p><p><strong>Математически анализи:</strong> пресмятаха разходите на едно семейство за вода, щети при наводнения и начини за пестене на ресурса.</p><p><strong>Дигитално проучване и статии:</strong> работата е свързана с авторската статия „Синя планета“.</p><p><strong>Английски език:</strong> изработени са информационни брошури с конкретни съвети за опазване на водните ресурси.</p></div>${imagePanel("Води")}</div>`)}
    ${section("„Синя планета“ и брошурите на английски език", "", `<div class="message-box reveal"><p>В качените файлове няма материал с точно име „Синя планета“. Затова бутонът води към наличните водни материали, които могат да се четат като PDF или да се изтеглят като оригинални файлове.</p><p><a class="btn green" href="#water-materials"><i class="fa-solid fa-file-arrow-down"></i>Вижте наличните водни материали</a></p></div>`, false)}
    ${resourceSection("Водни материали", "Води", true, "water-materials")}
    ${galleryPreview("Снимки за темата Водата", "Води")}`);
}

function forestPage() {
  shell(`${hero("Горите - зеленото сърце на Сливен. Причини, последствия и мерки.", "Човекът и природата, Математика, БЕЛ, Английски език", "fa-fire-flame-curved", "Прогимназиален етап - Тема 2")}
    ${section("Как да пазим горите от пожари", "", `<div class="grid-2 reveal"><div class="white-card project-text"><p>Темата за горските пожари докосна учениците лично чрез теренни проучвания и срещи с експерти в Сливенския регион.</p><p><strong>Учене на терен и лекции:</strong> проведено е посещение на засегнатата от пожари площ на Бармук баир и на разсадник „Абланово“. Полезна беше лекцията от инж. Зорка Андреева-Минчева, главен експерт в Регионална дирекция по горите - Сливен.</p><p><strong>Математика в действие:</strong> учениците приложиха знанията си за лице на равнинни фигури, за да изчислят реалната площ на засегнатите гори и бюджет за възстановяване.</p><p><strong>Творчество и превенция:</strong> учениците писаха екологични статии и създадоха брошури и апели за превенция на английски език.</p></div>${imagePanel("Гори")}</div>`)}
    ${section("Причини, последствия и мерки", "", `<div class="grid-3 stagger">${infoCard("Причини", "Небрежно боравене с огън, човешки грешки и природни фактори.", "fa-triangle-exclamation")}${infoCard("Последствия", "Унищожени гори, замърсен въздух, загуба на биоразнообразие и щети за хората.", "fa-smog")}${infoCard("Мерки", "Превенция, бързо сигнализиране, спазване на забрани и възстановяване чрез залесяване.", "fa-shield-halved")}</div>`, true)}
    ${resourceSection("Материали за горските пожари", "Гори", false)}
    ${galleryPreview("Снимки от Бармук баир, Абланово и училищните дейности", "Гори")}`);
}

function healthyPage() {
  shell(`${hero("Здравословно хранене: Насоки за ума, тялото и тонуса", "Човекът и природата, КМИТ, Математика, БЕЛ, Английски език", "fa-apple-whole", "Прогимназиален етап - Тема 3")}
    ${section("Здравословно хранене за всички", "", `<div class="grid-2 reveal"><div class="white-card project-text"><p>Учениците от 5. и 7. клас се потопиха в диетологията чрез теория, дигитални технологии и много вкусна практика.</p><p><strong>Биология и диетология:</strong> научиха как влияе балансираното хранене и какви са опасностите от вредните навици.</p><p><strong>Специални гости:</strong> учениците посрещнаха бъдещи специалисти от Университета по хранителни технологии - Пловдив, Цветомира Цумпова и Димитър Желев. Лекция изнесе и сливенският диетолог Ваня Проданова.</p><p><strong>Практика:</strong> приготвяха здравословна закуска, смутита и полезни менюта.</p><p><strong>КМИТ, Математика, БЕЛ и АЕ:</strong> работиха с приложения за калории и вода, създадоха презентации с рецепти, седмични менюта, есета, статии и брошури.</p></div>${imagePanel("Хранене")}</div>`)}
    ${resourceSection("Рецепти, менюта, есета и презентации", "Хранене", true)}
    ${galleryPreview("Снимки от здравословното хранене", "Хранене")}`);
}

function galleryPage() {
  const cats = [["Всички", "fa-table-cells"], ["Скрач", "fa-code"], ["Води", "fa-water"], ["Гори", "fa-fire-flame-curved"], ["Хранене", "fa-apple-whole"]];
  shell(`${hero("Споделен опит: Снимки и ученически проекти", "Снимки от дейностите и най-добрите ученически презентации/материали.", "fa-images", "Галерия и ресурси")}
    ${section("Големи папки с материали", "Страницата е разделена според изискването.", `<div class="grid-4 stagger">${infoAction("Фотогалерия", `${galleryFiles().length} снимки от Сливенските реки, Бармук баир, Абланово, Scratch и здравословно хранене.`, "fa-images", "#gallery-grid", "Разгледай")}${infoAction("Най-добрите презентации", `${presentationFiles().length} PDF/PPTX файла от ученици, учители и външни лектори.`, "fa-chalkboard-teacher", "/presentations/", "Отвори")}${infoAction("Брошури и есета", `${filesByExt(".docx").length + filesByExt(".pdf").length} документа и PDF материали за четене и изтегляне.`, "fa-file-lines", "/downloads/", "Виж")}${infoAction("Видео и документи", `${filesByExt(".mp4").length} видео файла и допълнителни проектни материали.`, "fa-film", "/downloads/", "Преглед")}</div>`)}
    <section class="section"><div class="container"><header class="section-header reveal"><h2><i class="fa-solid fa-filter"></i> Избери категория:</h2></header><div class="tabs gallery-tabs">${cats.map(([cat, icon], index) => `<button class="tab-btn gallery-filter ${index === 0 ? "active" : ""}" data-filter="${cat}"><i class="fa-solid ${icon}"></i>${cat}</button>`).join("")}</div><div class="gallery-grid stagger" id="gallery-grid">${galleryFiles().map(galleryItem).join("")}</div></div></section>`);
}

function presentationsPage() {
  const files = presentationFiles();
  const students = files.filter(file => /ученици|УЧЕНИЦИ/i.test(file.path));
  const other = files.filter(file => !students.includes(file));
  shell(`${hero("Презентации", "PDF и PowerPoint презентации, които могат да се разглеждат онлайн.", "fa-chalkboard-teacher", "Ресурси")}
    ${section("Преглед в браузъра", "", `<div class="message-box reveal"><p>PDF и PowerPoint материалите могат да се разглеждат директно в сайта, а оригиналните файлове остават достъпни за изтегляне.</p></div>`, true)}
    ${section("Презентации на ученици", "Най-добрите ученически проекти от качения архив.", `<div class="presentation-list">${students.map((file, index) => presentationCard(file, `students_${index}`)).join("")}</div>`)}
    ${section("Презентации, лекции и методически материали", "Материали от учители и външни лектори.", `<div class="presentation-list">${other.map((file, index) => presentationCard(file, `other_${index}`)).join("")}</div>`, true)}`);
}

function downloadsPage() {
  const files = uploads.filter(file => [".docx", ".pdf", ".pptx", ".mp4"].includes(file.ext));
  shell(`${hero("Материали за изтегляне", "Документи, статии, брошури, презентации и видео от качения архив.", "fa-download", "Ресурси")}
    ${section("Всички материали", "Всеки файл има оригинал за изтегляне и удобен преглед, когато е наличен.", `<div class="resource-list">${files.map(resourceCard).join("")}</div>`)}`);
}

function contactsPage() {
  shell(`${hero("Контакти", "Информация за училището.", "fa-address-card", "Контакти")}
    ${section("ОУ „Панайот Хитов“ - гр. Сливен", "", `<div class="grid-2 reveal"><div class="white-card project-text"><h3><i class="fa-solid fa-school"></i> Училище</h3><p>ОУ „Панайот Хитов“</p><p>гр. Сливен, ул. Братя Кутеви 12А</p></div><div class="white-card project-text"><h3><i class="fa-solid fa-lightbulb"></i> Проект</h3><p>Иновации в действие: Интердисциплинарни дейности в училище</p><p>Национална програма „Иновации в действие“, Модул 1</p></div></div>`)}`);
}

function infoCard(title, text, icon) {
  return `<article class="feature-card"><span class="round-icon"><i class="fa-solid ${icon}"></i></span><h3>${title}</h3><p>${text}</p></article>`;
}

function infoAction(title, text, icon, href, action) {
  return `<article class="feature-card"><span class="round-icon"><i class="fa-solid ${icon}"></i></span><h3>${title}</h3><p>${text}</p><a class="btn" href="${href}"><i class="fa-solid fa-arrow-right"></i>${action}</a></article>`;
}

function imagePanel(category) {
  const images = categoryImages(category).slice(0, 2);
  if (!images.length) return `<div class="white-card project-text"><p>Снимките за този раздел са налични в галерията.</p></div>`;
  return `<div class="media-strip">${images.map(galleryItem).join("")}</div>`;
}

function galleryPreview(title, category) {
  const images = categoryImages(category).slice(0, 8);
  return section(title, `${categoryImages(category).length} снимки`, `<div class="gallery-grid stagger">${images.map(galleryItem).join("")}</div><p style="text-align:center;margin-top:32px"><a class="btn green" href="/gallery/"><i class="fa-solid fa-images"></i>Виж всички снимки</a></p>`, true);
}

function galleryItem(file) {
  return `<button class="gallery-item" type="button" data-src="${assetUrl(file.path)}" data-title="${escapeHtml(cleanTitle(file.name))}" data-category="${fileCategory(file.path)}"><img src="${assetUrl(file.path)}" alt="${escapeHtml(cleanTitle(file.name))}" loading="lazy"><span>${fileCategory(file.path)} - ${escapeHtml(cleanTitle(file.name))}</span></button>`;
}

function resourceSection(title, category, alt, id = "") {
  const files = categoryFiles(category).filter(file => [".docx", ".pdf", ".pptx", ".mp4"].includes(file.ext));
  return section(title, `${files.length} качени файла`, `<div class="resource-list">${files.map(resourceCard).join("")}</div>`, alt, id);
}

function resourceCard(file) {
  const preview = previewFor(file);
  const previewLabel = file.ext === ".mp4" ? "Пусни" : "Преглед";
  const previewIcon = file.ext === ".mp4" ? "fa-play" : "fa-eye";
  const previewMeta = preview && file.ext !== ".pdf" && file.ext !== ".mp4" ? " - PDF преглед" : "";
  const youtubeId = youtubeFor(file);
  const previewButton = youtubeId
    ? `<button class="btn ghost video-play-btn" type="button" data-youtube-id="${youtubeId}" data-title="${escapeHtml(cleanTitle(file.name))}"><i class="fa-solid ${previewIcon}"></i>${previewLabel}</button>`
    : preview ? `<a class="btn ghost" href="${assetUrl(preview)}" target="_blank" rel="noreferrer"><i class="fa-solid ${previewIcon}"></i>${previewLabel}</a>` : "";
  const originalButton = youtubeId
    ? `<a class="btn green" href="${youtubeWatchUrl(youtubeId)}" target="_blank" rel="noreferrer"><i class="fa-brands fa-youtube"></i>YouTube</a>`
    : file.externalUrl ? `<a class="btn green" href="${escapeHtml(file.externalUrl)}" target="_blank" rel="noreferrer"><i class="fa-solid fa-up-right-from-square"></i>Оригинал</a>`
    : file.external ? ""
    : `<a class="btn green" href="${assetUrl(file.path)}" download><i class="fa-solid fa-download"></i>Оригинал</a>`;
  return `<article class="resource-card reveal"><span class="round-icon"><i class="fa-solid ${fileIcon(file)}"></i></span><div><h3>${escapeHtml(cleanTitle(file.name))}</h3><p>${fileCategory(file.path)} - ${file.ext.replace(".", "").toUpperCase()}${previewMeta}</p><span class="tag">${Math.round(file.size / 1024)} KB</span></div>${previewButton}${originalButton}</article>`;
}

function presentationCard(file, viewerId) {
  const preview = previewFor(file);
  const originalButton = file.externalUrl
    ? `<a class="btn green" href="${escapeHtml(file.externalUrl)}" target="_blank" rel="noreferrer"><i class="fa-solid fa-up-right-from-square"></i>Оригинал</a>`
    : file.external ? "" : `<a class="btn green" href="${assetUrl(file.path)}" download><i class="fa-solid fa-download"></i>Оригинал</a>`;
  const viewerBody = preview
    ? `<iframe class="preview-frame" src="${assetUrl(preview)}#toolbar=0&navpanes=0&scrollbar=1" title="${escapeHtml(cleanTitle(file.name))}"></iframe>`
    : `<div class="preview-frame missing-preview"><i class="fa-solid fa-file-circle-exclamation"></i><p>Файлът не е включен в публичната версия.</p></div>`;
  return `<article class="presentation-card reveal">
    <div class="presentation-header"><div class="presentation-icon"><i class="fa-solid ${fileIcon(file)}"></i></div><div class="presentation-info"><h3>${escapeHtml(cleanTitle(file.name))}</h3><p>${fileCategory(file.path)} - ${file.ext.replace(".", "").toUpperCase()}</p><div class="tag-row"><span class="tag">${fileCategory(file.path)}</span><span class="tag">${file.ext}</span>${preview && file.ext !== ".pdf" ? `<span class="tag">PDF преглед</span>` : ""}</div></div><button class="btn toggle-viewer-btn" data-viewer="${viewerId}"><i class="fa-solid fa-eye"></i>Преглед</button></div>
    <div class="presentation-viewer" id="${viewerId}"><div class="viewer-actions">${preview ? `<a class="btn ghost" href="${assetUrl(preview)}" target="_blank" rel="noreferrer"><i class="fa-solid fa-up-right-from-square"></i>Отвори PDF</a>` : ""}${originalButton}<button class="btn close-viewer-btn" data-viewer="${viewerId}"><i class="fa-solid fa-xmark"></i>Затвори</button></div>${viewerBody}</div>
  </article>`;
}

function modal() {
  return `<div class="modal" id="modal"><div class="modal-panel"><div class="modal-head"><h2 id="modal-title"></h2><button class="modal-close" type="button" aria-label="Затвори">&times;</button></div><div id="modal-body"></div></div></div>`;
}

function wireInteractions() {
  document.querySelector(".menu-toggle")?.addEventListener("click", event => {
    const menu = document.querySelector(".nav-menu");
    const open = menu.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
  });
  document.querySelector(".dropdown-toggle")?.addEventListener("click", event => {
    event.currentTarget.closest(".dropdown").classList.toggle("open");
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".dropdown")) document.querySelector(".dropdown")?.classList.remove("open");
  });
  document.querySelectorAll(".gallery-filter").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".gallery-filter").forEach(item => item.classList.toggle("active", item === button));
    const filter = button.dataset.filter;
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;
    grid.innerHTML = galleryFiles().filter(file => filter === "Всички" || fileCategory(file.path) === filter).map(galleryItem).join("");
    wireGalleryItems();
  }));
  wireGalleryItems();
  wirePresentationViewers();
  wireVideoPlayers();
  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 35, 210)}ms`;
    requestAnimationFrame(() => element.classList.add("in-view"));
  });
}

function wireGalleryItems() {
  document.querySelectorAll(".gallery-item").forEach(item => item.addEventListener("click", () => {
    openModal(item.dataset.title, `<img class="lightbox-img" src="${item.dataset.src}" alt="${escapeHtml(item.dataset.title)}">`);
  }));
}

function wirePresentationViewers() {
  document.querySelectorAll(".toggle-viewer-btn").forEach(button => button.addEventListener("click", () => {
    const viewer = document.getElementById(button.dataset.viewer);
    const open = !viewer.classList.contains("open");
    viewer.classList.toggle("open", open);
    button.innerHTML = open ? '<i class="fa-solid fa-eye-slash"></i>Скрий' : '<i class="fa-solid fa-eye"></i>Преглед';
    if (open) setTimeout(() => viewer.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }));
  document.querySelectorAll(".close-viewer-btn").forEach(button => button.addEventListener("click", () => {
    const viewer = document.getElementById(button.dataset.viewer);
    viewer.classList.remove("open");
    const toggle = document.querySelector(`.toggle-viewer-btn[data-viewer="${button.dataset.viewer}"]`);
    if (toggle) toggle.innerHTML = '<i class="fa-solid fa-eye"></i>Преглед';
  }));
}

function wireVideoPlayers() {
  document.querySelectorAll(".video-play-btn").forEach(button => button.addEventListener("click", () => {
    openModal(button.dataset.title, `<div class="youtube-frame"><iframe src="${youtubeEmbedUrl(button.dataset.youtubeId)}" title="${escapeHtml(button.dataset.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`);
  }));
}

function openModal(title, body) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

document.addEventListener("click", event => {
  if (event.target.matches(".modal-close") || event.target.id === "modal") {
    document.getElementById("modal")?.classList.remove("open");
    document.getElementById("modal-body").innerHTML = "";
    document.body.style.overflow = "";
  }
});

function filesByExt(ext) {
  return uploads.filter(file => file.ext === ext);
}

function galleryFiles() {
  return uploads.filter(file => [".jpg", ".jpeg", ".png", ".webp"].includes(file.ext));
}

function presentationFiles() {
  return uploads.filter(file => [".pdf", ".pptx"].includes(file.ext));
}

function categoryFiles(category) {
  return uploads.filter(file => fileCategory(file.path) === category);
}

function categoryImages(category) {
  return galleryFiles().filter(file => fileCategory(file.path) === category);
}

function firstImage(category) {
  return categoryImages(category)[0]?.path || "";
}

function previewFor(file) {
  const renderedPreview = renderedPdfs.find(item => item.originalPath === file.path)?.pdfPath || "";
  if (file.ext === ".mp4") return youtubeFor(file) ? youtubeEmbedUrl(youtubeFor(file)) : file.path;
  if (file.external) return renderedPreview;
  if (file.ext === ".pdf") return renderedPreview || file.path;
  return renderedPreview;
}

function youtubeFor(file) {
  return youtubeVideos[file.file] || "";
}

function youtubeEmbedUrl(id) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

function youtubeWatchUrl(id) {
  return `https://youtu.be/${id}`;
}

function assetUrl(path) {
  return encodeURI(path);
}

function fileCategory(path) {
  const lower = path.toLowerCase();
  if (lower.includes("скрач") || lower.includes("scratch")) return "Скрач";
  if (lower.includes("водата") || lower.includes("води") || lower.includes("реки")) return "Води";
  if (lower.includes("горите") || lower.includes("пожар") || lower.includes("абланово") || lower.includes("бармук")) return "Гори";
  if (lower.includes("здравословно") || lower.includes("хранене") || lower.includes("диетолог") || lower.includes("смути")) return "Хранене";
  return "Други";
}

function fileIcon(file) {
  if (file.ext === ".pptx") return "fa-file-powerpoint";
  if (file.ext === ".pdf") return "fa-file-pdf";
  if (file.ext === ".docx") return "fa-file-word";
  if (file.ext === ".mp4") return "fa-file-video";
  return "fa-file";
}

function cleanTitle(name) {
  return name.replace(/[_-]+/g, " ").replace(/\s+/g, " ").replace(/\(\d+\)$/g, "").trim();
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

async function init() {
  try {
    const response = await fetch("/assets/uploads/manifest.json", { cache: "no-store" });
    uploads = response.ok ? await response.json() : [];
  } catch {
    uploads = [];
  }
  try {
    const response = await fetch("/assets/rendered-pdfs/manifest.json", { cache: "no-store" });
    renderedPdfs = response.ok ? await response.json() : [];
  } catch {
    renderedPdfs = [];
  }
  const routes = {
    home: homePage,
    scratch: scratchPage,
    "water-resources": waterPage,
    "forest-fires": forestPage,
    "healthy-eating": healthyPage,
    gallery: galleryPage,
    presentations: presentationsPage,
    downloads: downloadsPage,
    contacts: contactsPage,
  };
  (routes[PAGE] || homePage)();
}

init();
