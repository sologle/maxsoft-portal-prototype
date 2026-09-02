import type {
  Article,
  AuditEntry,
  Company,
  CompanyFieldSetting,
  CompanyType,
  KbNode,
  KnowledgeFile,
  PortalUser,
  RoleInfo,
  Tag,
  TagGroup,
} from './types'

export const ROLES: RoleInfo[] = [
  {
    id: 'guest',
    name: 'Гость',
    short: 'Г',
    description: 'Вход, регистрация, восстановление и закрытая ссылка',
    staff: false,
    sections: [],
  },
  {
    id: 'admin',
    name: 'Администратор портала',
    short: 'АП',
    description: 'Полный доступ к БЗ, компаниям, пользователям и настройкам',
    staff: true,
    sections: ['Главная', 'База знаний', 'Компании', 'Пользователи портала', 'Администрирование'],
  },
  {
    id: 'engineer',
    name: 'Инженер ТП / автор',
    short: 'ИТП',
    description: 'Статьи, файлы, компании и пользователи без настроек портала',
    staff: true,
    sections: ['Главная', 'База знаний', 'Компании', 'Пользователи портала'],
  },
  {
    id: 'manager',
    name: 'Менеджер',
    short: 'М',
    description: 'Компании, пользователи и просмотр staff-версии БЗ',
    staff: true,
    sections: ['Главная', 'База знаний', 'Компании', 'Пользователи портала'],
  },
  {
    id: 'client-admin',
    name: 'Администратор клиента',
    short: 'АК',
    description: 'Доступная БЗ и сотрудники только своей компании',
    staff: false,
    sections: ['Главная', 'База знаний', 'Пользователи компании'],
  },
  {
    id: 'client-user',
    name: 'Сотрудник клиента',
    short: 'СК',
    description: 'Просмотр и поиск доступных материалов',
    staff: false,
    sections: ['Главная', 'База знаний'],
  },
]

export const roleById = (id: string) => ROLES.find((r) => r.id === id)

export const COMPANY_TYPES: CompanyType[] = [
  {
    id: 't-basic',
    name: 'Базовый клиент',
    description: 'Общая база знаний и создание запросов в поддержку',
    companiesCount: 14,
    articlesCount: 96,
  },
  {
    id: 't-vip',
    name: 'ВИП-клиент',
    description: 'Расширенная база знаний и приоритетное сопровождение',
    companiesCount: 3,
    articlesCount: 128,
  },
  {
    id: 't-partner',
    name: 'Партнёр',
    description: 'Внедренческие организации, сопровождающие своих клиентов',
    companiesCount: 2,
    articlesCount: 84,
  },
]

export const COMPANIES: Company[] = [
  {
    id: 'c-sibir',
    fullName: 'ООО «СибирьПроект»',
    shortName: 'СибирьПроект',
    inn: '5405012345',
    kpp: '540501001',
    address: 'г. Новосибирск, ул. Депутатская, 46, оф. 1201',
    email: 'info@sibirproject.ru',
    phone: '+7 (383) 210-45-67',
    typeId: 't-vip',
    status: 'Активна',
    statusUntil: '31.12.2026',
    contract: '№ 127-БС от 14.03.2025',
    contractDate: '14.03.2025',
    project: 'АСУ ТП «Сибирь»',
    bitrix: 'https://maxsoft.bitrix24.ru/crm/company/157/',
    domains: ['sibirproject.ru'],
    usersCount: 4,
  },
  {
    id: 'c-stroy',
    fullName: 'АО «Строймаш»',
    shortName: 'Строймаш',
    inn: '6321019876',
    kpp: '632101001',
    address: 'г. Красноярск, пр. Мира, 91, корп. 2',
    email: 'office@stroymash.ru',
    phone: '+7 (391) 240-11-02',
    typeId: 't-basic',
    status: 'Активна',
    statusUntil: '30.06.2027',
    contract: '№ 98-БС от 02.11.2025',
    contractDate: '02.11.2025',
    project: '—',
    bitrix: 'https://maxsoft.bitrix24.ru/crm/company/203/',
    domains: ['stroymash.ru'],
    usersCount: 2,
  },
  {
    id: 'c-kov',
    fullName: 'ИП Ковалёв Д. С.',
    shortName: 'Ковалёв Д. С.',
    inn: '540612345678',
    kpp: '—',
    address: 'г. Новосибирск, ул. Гоголя, 15, кв. 88',
    email: 'kovalev.design@mail.ru',
    phone: '+7 (913) 555-32-18',
    typeId: 't-basic',
    status: 'Истекает',
    statusUntil: '15.09.2026',
    contract: '№ 141-БС от 15.09.2025',
    contractDate: '15.09.2025',
    project: '—',
    bitrix: 'https://maxsoft.bitrix24.ru/crm/company/244/',
    domains: [],
    usersCount: 1,
  },
  {
    id: 'c-tech',
    fullName: 'ООО «ТехноЛайн»',
    shortName: 'ТехноЛайн',
    inn: '7701234567',
    kpp: '770101001',
    address: 'г. Москва, ул. Автозаводская, 23, оф. 510',
    email: 'it@technoline.ru',
    phone: '+7 (495) 660-22-33',
    typeId: 't-partner',
    status: 'Приостановлена',
    statusUntil: '—',
    contract: '№ 74-БС от 20.05.2024',
    contractDate: '20.05.2024',
    project: 'Пилот «ТехноЛайн»',
    bitrix: 'https://maxsoft.bitrix24.ru/crm/company/88/',
    domains: ['technoline.ru'],
    usersCount: 3,
  },
  {
    id: 'c-energo',
    fullName: 'ПАО «ЭнергоСеть»',
    shortName: 'ЭнергоСеть',
    inn: '5402233445',
    kpp: '540201001',
    address: 'г. Новосибирск, ул. Кирова, 113',
    email: 'support@energoset.ru',
    phone: '+7 (383) 227-88-40',
    typeId: 't-vip',
    status: 'Активна',
    statusUntil: '31.03.2027',
    contract: '№ 112-БС от 01.02.2025',
    contractDate: '01.02.2025',
    project: 'Диспетчеризация сетей',
    bitrix: 'https://maxsoft.bitrix24.ru/crm/company/131/',
    domains: ['energoset.ru'],
    usersCount: 5,
  },
]

export const PORTAL_USERS: PortalUser[] = [
  { id: 'u1', name: 'Алексей Соколов', email: 'a.sokolov@maxsoft.ru', role: 'admin', companyId: null, status: 'Активен', lastActive: 'сегодня, 11:20' },
  { id: 'u2', name: 'Павел Романов', email: 'p.romanov@maxsoft.ru', role: 'engineer', companyId: null, status: 'Активен', lastActive: 'сегодня, 10:05' },
  { id: 'u3', name: 'Ольга Белова', email: 'o.belova@maxsoft.ru', role: 'manager', companyId: null, status: 'Активен', lastActive: 'вчера, 18:42' },
  { id: 'u7', name: 'Елена Соколова', email: 'e.sokolova@maxsoft.ru', role: 'engineer', companyId: null, status: 'Активен', lastActive: 'вчера, 16:15' },
  { id: 'u4', name: 'Мария Орлова', email: 'm.orlova@sibirproject.ru', role: 'client-admin', companyId: 'c-sibir', companyRole: 'admin', status: 'Активен', lastActive: 'сегодня, 09:48' },
  { id: 'u5', name: 'Иван Петров', email: 'i.petrov@sibirproject.ru', role: 'client-user', companyId: 'c-sibir', companyRole: 'member', status: 'Активен', lastActive: 'сегодня, 11:02' },
  { id: 'u8', name: 'Анна Кузнецова', email: 'a.kuznetsova@sibirproject.ru', role: 'client-user', companyId: 'c-sibir', companyRole: 'member', status: 'Приглашён', lastActive: '—' },
  { id: 'u9', name: 'Сергей Ветров', email: 's.vetrov@sibirproject.ru', role: 'client-user', companyId: 'c-sibir', companyRole: 'member', status: 'Заблокирован', blockedAt: '12.08.2026', lastActive: '05.08.2026' },
  { id: 'u6', name: 'Андрей Крылов', email: 'a.krylov@stroymash.ru', role: 'client-admin', companyId: 'c-stroy', companyRole: 'admin', status: 'Активен', lastActive: '28.08.2026' },
  { id: 'u10', name: 'Дмитрий Лапин', email: 'd.lapin@energoset.ru', role: 'client-admin', companyId: 'c-energo', companyRole: 'admin', status: 'Активен', lastActive: '31.08.2026' },
]

export const COMPANY_USERS_SIBIR: PortalUser[] = PORTAL_USERS.filter((u) => u.companyId === 'c-sibir')

export const TAG_GROUPS: TagGroup[] = [
  { id: 'g-products', name: 'Продукты' },
  { id: 'g-process', name: 'Процессы' },
  { id: 'g-admin', name: 'Администрирование' },
]

export const TAGS: Tag[] = [
  { id: 'tag-navisa', name: 'НАВИСА', groupId: 'g-products', articlesCount: 12 },
  { id: 'tag-standart', name: 'СТАНДАРТ', groupId: 'g-products', articlesCount: 7 },
  { id: 'tag-install', name: 'Установка', groupId: 'g-process', articlesCount: 9 },
  { id: 'tag-setup', name: 'Настройка', groupId: 'g-process', articlesCount: 14 },
  { id: 'tag-update', name: 'Обновление', groupId: 'g-process', articlesCount: 8 },
  { id: 'tag-integration', name: 'Интеграция', groupId: 'g-process', articlesCount: 5 },
  { id: 'tag-license', name: 'Лицензирование', groupId: 'g-admin', articlesCount: 6 },
  { id: 'tag-backup', name: 'Резервное копирование', groupId: 'g-admin', articlesCount: 4 },
]

export const KB_NODES: KbNode[] = [
  { id: 'n-products', name: 'Продукты', parentId: null },
  { id: 'n-navisa', name: 'НАВИСА', parentId: 'n-products' },
  { id: 'n-navisa-install', name: 'Установка', parentId: 'n-navisa' },
  { id: 'n-navisa-setup', name: 'Настройка', parentId: 'n-navisa' },
  { id: 'n-navisa-update', name: 'Обновление', parentId: 'n-navisa' },
  { id: 'n-standart', name: 'СТАНДАРТ', parentId: 'n-products' },
  { id: 'n-cases', name: 'Кейсы внедрения', parentId: null },
  { id: 'n-admin', name: 'Администрирование', parentId: null },
  { id: 'n-licenses', name: 'Лицензии и ключи', parentId: 'n-admin' },
  { id: 'n-updates', name: 'Обновления', parentId: 'n-admin' },
  { id: 'n-integrations', name: 'Интеграции', parentId: 'n-admin' },
  { id: 'n-errors', name: 'Ошибки установки', parentId: 'n-admin' },
]

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    slug: 'ustanovka-navisa',
    title: 'Установка НАВИСА на рабочую станцию',
    summary: 'Пошаговая установка клиента, выбор каталога данных и первый запуск.',
    nodeId: 'n-navisa-install',
    status: 'published',
    author: 'Елена Соколова',
    authorShort: 'ЕС',
    updatedAt: '26.08.2026',
    minutes: 8,
    tagIds: ['tag-navisa', 'tag-install'],
    typeIds: ['t-basic', 't-vip', 't-partner'],
    attachments: [
      { id: 'f-pkg', name: 'navisa-4.8-setup.zip', ext: 'zip', size: '124 МБ' },
      { id: 'f-chk1', name: 'чек-лист_установки.pdf', ext: 'pdf', size: '340 КБ' },
    ],
    body: `<p>В статье описана типовая установка клиента НАВИСА на рабочую станцию под управлением Windows 10/11.</p>
<h2>Перед установкой</h2><ul><li>Проверьте системные требования по статье «Проверка системных требований».</li><li>Убедитесь, что у пользователя есть права локального администратора.</li></ul>
<h2>Порядок установки</h2><ol><li>Скачайте дистрибутив из блока файлов ниже.</li><li>Запустите <b>navisa-4.8-setup.zip</b> и следуйте шагам мастера.</li><li>Выберите каталог данных — по умолчанию <code>C:\\NAVISA\\Data</code>.</li><li>После установки укажите адрес сервера лицензий.</li></ol>
<h2>Первый запуск</h2><p>При первом запуске мастер предложит подключиться к серверу. Используйте ключ, выданный администратором портала.</p>`,
  },
  {
    id: 'a2',
    slug: 'nastroika-licenzii',
    title: 'Настройка лицензии и подключение к серверу',
    summary: 'Активация сетевой лицензии и проверка соединения с сервером компании.',
    nodeId: 'n-navisa-setup',
    status: 'published',
    author: 'Андрей Крылов',
    authorShort: 'АК',
    updatedAt: '21.08.2026',
    minutes: 6,
    tagIds: ['tag-navisa', 'tag-setup', 'tag-license'],
    typeIds: ['t-basic', 't-vip', 't-partner'],
    attachments: [],
    body: `<p>Сетевая лицензия активируется один раз на сервере и обслуживает все рабочие места.</p>
<h2>Активация</h2><ol><li>Откройте «Администрирование → Лицензии».</li><li>Вставьте ключ активации из письма.</li><li>Нажмите «Проверить» — статус должен стать зелёным.</li></ol>
<h2>Подключение клиентов</h2><p>На рабочих станциях укажите адрес сервера и порт 4880. Проверьте доступность порта политиками сети.</p>`,
  },
  {
    id: 'a3',
    slug: 'obnovlenie-navisa-4-8',
    title: 'Обновление НАВИСА до версии 4.8',
    summary: 'Резервная копия, установка обновления и контроль совместимости проектов.',
    nodeId: 'n-navisa-update',
    status: 'published',
    author: 'Мария Воронова',
    authorShort: 'МВ',
    updatedAt: '18.08.2026',
    minutes: 10,
    tagIds: ['tag-navisa', 'tag-update'],
    typeIds: ['t-basic', 't-vip', 't-partner'],
    attachments: [],
    body: `<p>Перед обновлением обязательно создайте резервную копию базы и каталога данных.</p>
<h2>Резервная копия</h2><p>Используйте встроенный инструмент «Обслуживание → Резервная копия» или регламентное задание сервера.</p>
<h2>Установка обновления</h2><ol><li>Остановите службу НАВИСА.</li><li>Запустите пакет обновления.</li><li>Запустите службу и проверьте версию в «О программе».</li></ol>
<h2>Совместимость</h2><p>Проекты версии 4.x совместимы с 4.8 без конвертации. Откат возможен только на резервную копию.</p>`,
  },
  {
    id: 'a4',
    slug: 'perenos-shablonov',
    title: 'Перенос пользовательских шаблонов',
    summary: 'Как сохранить профили, библиотеки материалов и шаблоны при переустановке.',
    nodeId: 'n-navisa-install',
    status: 'draft',
    author: 'Павел Романов',
    authorShort: 'ПР',
    updatedAt: '14.08.2026',
    minutes: 5,
    tagIds: ['tag-navisa', 'tag-install'],
    typeIds: ['t-basic', 't-vip', 't-partner'],
    attachments: [],
    body: `<p>Черновик: описываем перенос каталога <code>%APPDATA%\\NAVISA\\Templates</code> при переустановке.</p>`,
  },
  {
    id: 'a5',
    slug: 'sistemnye-trebovaniya',
    title: 'Проверка системных требований',
    summary: 'Чек-лист оборудования, драйверов и прав доступа перед установкой.',
    nodeId: 'n-navisa-install',
    status: 'published',
    author: 'Ольга Белова',
    authorShort: 'ОБ',
    updatedAt: '09.08.2026',
    minutes: 4,
    tagIds: ['tag-navisa', 'tag-install'],
    typeIds: ['t-basic', 't-vip', 't-partner'],
    attachments: [],
    body: `<p>Минимальные и рекомендуемые требования для рабочих станций НАВИСА 4.8.</p>
<h2>Минимальные</h2><ul><li>CPU 4 ядра, 8 ГБ ОЗУ</li><li>Видеокарта с поддержкой OpenGL 3.3</li><li>5 ГБ на системном диске</li></ul>
<h2>Рекомендуемые</h2><ul><li>CPU 8 ядер, 16–32 ГБ ОЗУ</li><li>Дискретная видеокарта 4 ГБ</li><li>SSD 512 ГБ</li></ul>`,
  },
  {
    id: 'a6',
    slug: 'integraciya-sapr',
    title: 'Настройка интеграции с САПР-комплексом',
    summary: 'Синхронизация проектов НАВИСА с САПР-комплексом без ручного дублирования.',
    nodeId: 'n-navisa-setup',
    status: 'published',
    author: 'Анна Смирнова',
    authorShort: 'АС',
    updatedAt: '12.08.2026',
    minutes: 9,
    tagIds: ['tag-navisa', 'tag-setup', 'tag-integration'],
    typeIds: ['t-vip'],
    attachments: [
      { id: 'f1', name: 'инструкция_интеграции.pdf', ext: 'pdf', size: '1,8 МБ' },
      { id: 'f2', name: 'пример_проекта.dwg', ext: 'dwg', size: '32 МБ' },
      { id: 'f3', name: 'коннектор_сапр.zip', ext: 'zip', size: '8,4 МБ' },
      { id: 'f4', name: 'чек-лист_настройки.docx', ext: 'docx', size: '640 КБ' },
    ],
    body: `<p>Интеграция позволяет синхронизировать проекты НАВИСА с САПР-комплексом и передавать параметры без ручного дублирования. Ниже — требования и порядок настройки подключения.</p>
<h2 id="req">Предварительные требования</h2>
<div class="callout"><b>Перед началом убедитесь, что среда готова к подключению:</b><ul><li>САПР-комплекс версии 2024.2 или новее</li><li>Права администратора портала и доступ к серверу лицензий</li><li>Разрешён исходящий HTTPS-трафик на порт 443</li></ul></div>
<h2 id="steps">Порядок настройки</h2>
<p>Настройка выполняется один раз для организации. Обычно она занимает 10–15 минут.</p>
<ol><li><b>Создайте ключ подключения.</b> Откройте «Администрирование → Интеграции», выберите САПР-комплекс и нажмите «Создать ключ». Скопируйте ключ — после закрытия окна он будет скрыт.</li><li><b>Укажите адрес сервера.</b> В настольном клиенте откройте раздел «Портал», вставьте адрес сервера и ключ подключения, затем сохраните параметры.</li></ol>
<figure>Рис. 1 — Окно параметров подключения</figure>
<ol start="3"><li><b>Сопоставьте проекты.</b> Выберите рабочие проекты, которые должны синхронизироваться с базой знаний. Для каждого проекта укажите код и единицы измерения.</li><li><b>Проверьте соединение.</b> Нажмите «Проверить». Успешное подключение отображается зелёным статусом, а дата последней синхронизации появится в карточке интеграции.</li></ol>
<h2 id="params">Параметры соединения</h2>
<table><thead><tr><th>Параметр</th><th>Значение</th><th>Обязателен</th></tr></thead><tbody>
<tr><td>Адрес API</td><td>https://portal.maxsoft.ru/api</td><td>Да</td></tr>
<tr><td>Интервал синхронизации</td><td>15 минут</td><td>Нет</td></tr>
<tr><td>Тайм-аут запроса</td><td>30 секунд</td><td>Нет</td></tr>
</tbody></table>`,
  },
  {
    id: 'a7',
    slug: 'rezervnoe-kopirovanie',
    title: 'Резервное копирование: видеоинструкция',
    summary: 'Настройка автоматических копий базы и каталога данных — пошаговое видео.',
    nodeId: 'n-admin',
    status: 'published',
    author: 'Павел Романов',
    authorShort: 'ПР',
    updatedAt: '05.08.2026',
    minutes: 15,
    tagIds: ['tag-backup', 'tag-setup'],
    typeIds: ['t-basic', 't-vip', 't-partner'],
    attachments: [
      { id: 'f5', name: 'резервное_копирование.mp4', ext: 'mp4', size: '120 МБ' },
    ],
    body: `<p>Видеоинструкция по настройке автоматического резервного копирования НАВИСА: расписание, место хранения и проверка восстановления.</p>
<video/>
<h2 id="tc-0">Полный обзор</h2><p>Общий порядок: включаем расписание, выбираем хранилище, проверяем восстановление из копии.</p>
<h2 id="tc-135">Расписание копий</h2><p>Ежедневная полная копия в 02:00 и ежечасные инкрементальные. Храним 14 дней на сервере и 3 месяца в архиве.</p>
<h2 id="tc-432">Проверка восстановления</h2><p>Раз в месяц разворачиваем копию на тестовом стенде и сравниваем контрольные суммы базы.</p>
<h2 id="tc-880">Хранилище и архив</h2><p>Отдельный диск или сетевой ресурс. Архивные копии — на внешнем носителе, доступ к которому ограничен.</p>`,
    video: {
      poster: '#0e2a40',
      duration: '16:20',
      timecodes: [
        { time: '00:00', seconds: 0, label: 'Полный обзор' },
        { time: '02:15', seconds: 135, label: 'Расписание копий' },
        { time: '07:12', seconds: 432, label: 'Проверка восстановления' },
        { time: '14:40', seconds: 880, label: 'Хранилище и архив' },
      ],
    },
  },
  {
    id: 'a8',
    slug: 'kommercheskie-usloviya',
    title: 'Коммерческие условия для ВИП-клиентов',
    summary: 'Закрытый материал: расширенные условия поддержки и SLA для ВИП-клиентов.',
    nodeId: 'n-licenses',
    status: 'published',
    author: 'Алексей Соколов',
    authorShort: 'АС',
    updatedAt: '28.07.2026',
    minutes: 3,
    tagIds: ['tag-license'],
    typeIds: ['t-vip'],
    attachments: [],
    body: `<p>Материал доступен только компаниям с типом «ВИП-клиент». В нём собраны расширенные условия сопровождения, время реакции и контакты выделенной линии.</p>`,
  },
  {
    id: 'a9',
    slug: 'partnerskaya-programma',
    title: 'Партнёрская программа: обучение и сертификация',
    summary: 'Условия партнёрства, учебные курсы и сертификация внедренческих организаций.',
    nodeId: 'n-cases',
    status: 'published',
    author: 'Ольга Белова',
    authorShort: 'ОБ',
    updatedAt: '20.07.2026',
    minutes: 6,
    tagIds: ['tag-license', 'tag-setup'],
    typeIds: ['t-partner'],
    attachments: [],
    body: `<p>Материал доступен только партнёрам MaxSoft: условия партнёрской программы, учебные курсы и процедура сертификации специалистов.</p>
<h2>Уровни партнёрства</h2><ul><li>Сертифицированный внедренец</li><li>Золотой партнёр</li></ul>
<h2>Обучение</h2><p>Курсы проводятся ежеквартально, запись через менеджера проекта.</p>`,
  },
]

export const articleById = (id: string) => ARTICLES.find((a) => a.id === id)
export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug)

export const AUDIT: AuditEntry[] = [
  { id: 'l1', date: '02.09.2026', time: '10:42', user: 'Алексей Соколов', action: 'Статья опубликована', target: 'Установка НАВИСА на рабочую станцию', kind: 'article' },
  { id: 'l2', date: '02.09.2026', time: '10:15', user: 'Павел Романов', action: 'Загружен файл', target: 'коннектор_сапр.zip', kind: 'file' },
  { id: 'l3', date: '01.09.2026', time: '17:38', user: 'Ольга Белова', action: 'Создана компания', target: 'ИП Ковалёв Д. С.', kind: 'company' },
  { id: 'l4', date: '01.09.2026', time: '14:02', user: 'Алексей Соколов', action: 'Изменена роль пользователя', target: 'Ольга Белова → Менеджер', kind: 'user' },
  { id: 'l5', date: '01.09.2026', time: '11:26', user: 'Павел Романов', action: 'Обновлены права статьи', target: 'Настройка интеграции с САПР-комплексом', kind: 'access' },
  { id: 'l6', date: '31.08.2026', time: '16:55', user: 'Елена Соколова', action: 'Черновик создан', target: 'Перенос пользовательских шаблонов', kind: 'article' },
  { id: 'l7', date: '31.08.2026', time: '12:30', user: 'Алексей Соколов', action: 'Приглашён пользователь', target: 'a.kuznetsova@sibirproject.ru', kind: 'user' },
  { id: 'l8', date: '29.08.2026', time: '09:12', user: 'Ольга Белова', action: 'Изменён тип компании', target: 'ООО «СибирьПроект» → ВИП-клиент', kind: 'company' },
  { id: 'l9', date: '28.08.2026', time: '18:20', user: 'Алексей Соколов', action: 'Статья снята с публикации', target: 'Прайс-лист 2025', kind: 'article' },
  { id: 'l10', date: '28.08.2026', time: '10:04', user: 'Павел Романов', action: 'Загружен файл', target: 'резервное_копирование.mp4', kind: 'file' },
  { id: 'l11', date: '27.08.2026', time: '15:47', user: 'Алексей Соколов', action: 'Обновлены настройки полей компании', target: 'Поля компании', kind: 'access' },
  { id: 'l12', date: '26.08.2026', time: '13:33', user: 'Елена Соколова', action: 'Статья опубликована', target: 'Проверка системных требований', kind: 'article' },
]

export const FILES: KnowledgeFile[] = [
  { id: 'f1', name: 'инструкция_интеграции.pdf', ext: 'pdf', size: '1,8 МБ', uploadedAt: '12.08.2026', uploadedBy: 'Анна Смирнова', usageArticleIds: ['a6'] },
  { id: 'f2', name: 'пример_проекта.dwg', ext: 'dwg', size: '32 МБ', uploadedAt: '12.08.2026', uploadedBy: 'Анна Смирнова', usageArticleIds: ['a6'] },
  { id: 'f3', name: 'коннектор_сапр.zip', ext: 'zip', size: '8,4 МБ', uploadedAt: '02.09.2026', uploadedBy: 'Павел Романов', usageArticleIds: ['a6'] },
  { id: 'f4', name: 'чек-лист_настройки.docx', ext: 'docx', size: '640 КБ', uploadedAt: '11.08.2026', uploadedBy: 'Анна Смирнова', usageArticleIds: ['a6'] },
  { id: 'f5', name: 'резервное_копирование.mp4', ext: 'mp4', size: '120 МБ', uploadedAt: '05.08.2026', uploadedBy: 'Павел Романов', usageArticleIds: ['a7'] },
  { id: 'f6', name: 'navisa-4.8-setup.zip', ext: 'zip', size: '124 МБ', uploadedAt: '18.08.2026', uploadedBy: 'Елена Соколова', usageArticleIds: ['a1'] },
  { id: 'f7', name: 'чек-лист_установки.pdf', ext: 'pdf', size: '340 КБ', uploadedAt: '26.08.2026', uploadedBy: 'Елена Соколова', usageArticleIds: ['a1'] },
]

export const FIELD_SETTINGS: CompanyFieldSetting[] = [
  { id: 'fullName', name: 'Полное наименование', show: true, required: true, unique: false, managerAccess: true, onRegister: true, onCreate: true, onEdit: true },
  { id: 'shortName', name: 'Сокращённое наименование', show: true, required: false, unique: false, managerAccess: true, onRegister: false, onCreate: true, onEdit: true },
  { id: 'inn', name: 'ИНН', show: true, required: true, unique: true, managerAccess: false, onRegister: true, onCreate: true, onEdit: false },
  { id: 'kpp', name: 'КПП', show: true, required: false, unique: false, managerAccess: false, onRegister: false, onCreate: true, onEdit: true },
  { id: 'address', name: 'Юридический адрес', show: true, required: false, unique: false, managerAccess: true, onRegister: false, onCreate: true, onEdit: true },
  { id: 'email', name: 'Основной email', show: true, required: true, unique: false, managerAccess: true, onRegister: true, onCreate: true, onEdit: true },
  { id: 'phone', name: 'Телефон', show: true, required: false, unique: false, managerAccess: true, onRegister: false, onCreate: true, onEdit: true },
  { id: 'type', name: 'Тип компании', show: true, required: true, unique: false, managerAccess: true, onRegister: false, onCreate: true, onEdit: true },
  { id: 'status', name: 'Статус компании', show: true, required: false, unique: false, managerAccess: false, onRegister: false, onCreate: true, onEdit: true },
  { id: 'statusUntil', name: 'Срок действия статуса', show: true, required: false, unique: false, managerAccess: false, onRegister: false, onCreate: true, onEdit: true },
  { id: 'contract', name: 'Договор / основание', show: true, required: false, unique: false, managerAccess: false, onRegister: false, onCreate: true, onEdit: true },
  { id: 'contractDate', name: 'Дата договора', show: true, required: false, unique: false, managerAccess: false, onRegister: false, onCreate: true, onEdit: true },
  { id: 'project', name: 'Проект', show: true, required: false, unique: false, managerAccess: true, onRegister: false, onCreate: true, onEdit: true },
  { id: 'bitrix', name: 'Ссылка на Битрикс24', show: true, required: false, unique: false, managerAccess: false, onRegister: false, onCreate: true, onEdit: true },
  { id: 'domains', name: 'Рабочие домены', show: true, required: false, unique: true, managerAccess: false, onRegister: true, onCreate: true, onEdit: true },
]

export const INTEGRATIONS = {
  smtp: {
    host: 'smtp.maxsoft.ru',
    port: '587',
    security: 'STARTTLS',
    sender: 'portal@maxsoft.ru',
    login: 'portal@maxsoft.ru',
    connected: true,
  },
  bitrix: {
    url: 'https://maxsoft.bitrix24.ru/rest/1/xxxx/',
    connected: true,
    lastSync: '02.09.2026, 09:30',
  },
}
