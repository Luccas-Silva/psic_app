/**
 * data_seed.js - Seed Data Inicial Desacoplado (PsicAPP)
 * Contém o banco de dados inicial com 8 Pacientes (50% Semanal e 50% Quinzenal),
 * histórico de consultas a partir de Agosto/2026, evoluções clínicas e lançamentos financeiros.
 */

window.SEED_DATA = (function() {
    const therapist = {
        name: "Dra. Anndreane Maliqui",
        crp: "06/123456",
        email: "anndreane.psico@email.com",
        phone: "(11) 98765-4321",
        address: "Santana - São Paulo/SP",
        cpf: "123.456.789-00",
        pin: "1234"
    };

    // 8 Pacientes: 4 com frequência Semanal (50%) e 4 com frequência Quinzenal (50%)
    const patients = [
        {
            id: "P001",
            name: "Ana Clara Silva",
            cpf: "123.456.789-01",
            phone: "(11) 98765-4321",
            email: "ana.clara@email.com",
            birthDate: "1992-05-14",
            profession: "Arquiteta",
            consultationFrequency: "Semanal",
            value: 220.00,
            status: "Ativo",
            notes: "Demanda principal: Ansiedade generalizada e organização de rotina.",
            createdAt: "2026-07-01"
        },
        {
            id: "P002",
            name: "Carlos Eduardo Santos",
            cpf: "234.567.890-12",
            phone: "(11) 97654-3210",
            email: "carlos.santos@email.com",
            birthDate: "1988-11-20",
            profession: "Engenheiro de Software",
            consultationFrequency: "Semanal",
            value: 250.00,
            status: "Ativo",
            notes: "Sintomas de Burnout corporativo e sobrecarga de liderança.",
            createdAt: "2026-07-05"
        },
        {
            id: "P003",
            name: "Juliana Oliveira Mendes",
            cpf: "345.678.901-23",
            phone: "(11) 96543-2109",
            email: "juliana.mendes@email.com",
            birthDate: "1995-03-08",
            profession: "Designer Gráfica",
            consultationFrequency: "Semanal",
            value: 220.00,
            status: "Ativo",
            notes: "Processo de luto recente e episódios depressivos leves.",
            createdAt: "2026-07-10"
        },
        {
            id: "P004",
            name: "Roberto Almeida Rocha",
            cpf: "456.789.012-34",
            phone: "(11) 95432-1098",
            email: "roberto.rocha@email.com",
            birthDate: "1983-08-30",
            profession: "Advogado",
            consultationFrequency: "Semanal",
            value: 240.00,
            status: "Ativo",
            notes: "Transtorno de pânico com ataques em ambientes fechados.",
            createdAt: "2026-07-15"
        },
        {
            id: "P005",
            name: "Beatriz Souza Lima",
            cpf: "567.890.123-45",
            phone: "(11) 94321-0987",
            email: "beatriz.lima@email.com",
            birthDate: "1998-12-05",
            profession: "Jornalista",
            consultationFrequency: "Quinzenal",
            value: 220.00,
            status: "Ativo",
            notes: "Transição de carreira e conflitos de identidade profissional.",
            createdAt: "2026-07-18"
        },
        {
            id: "P006",
            name: "Lucas Ferreira Costa",
            cpf: "678.901.234-56",
            phone: "(11) 93210-9876",
            email: "lucas.costa@email.com",
            birthDate: "1990-07-18",
            profession: "Administrador",
            consultationFrequency: "Quinzenal",
            value: 220.00,
            status: "Ativo",
            notes: "Dificuldade de estabelecimento de limites em relacionamentos afetivos.",
            createdAt: "2026-07-20"
        },
        {
            id: "P007",
            name: "Mariana Xavier Pires",
            cpf: "789.012.345-67",
            phone: "(11) 92109-8765",
            email: "mariana.pires@email.com",
            birthDate: "1993-02-25",
            profession: "Professora",
            consultationFrequency: "Quinzenal",
            value: 230.00,
            status: "Ativo",
            notes: "Maternidade atípica e sobrecarga mental familiar.",
            createdAt: "2026-07-22"
        },
        {
            id: "P008",
            name: "Gabriel Rodrigues Alves",
            cpf: "890.123.456-78",
            phone: "(11) 91098-7654",
            email: "gabriel.alves@email.com",
            birthDate: "1987-10-12",
            profession: "Consultor Financeiro",
            consultationFrequency: "Quinzenal",
            value: 250.00,
            status: "Ativo",
            notes: "Estresse corporativo e alterações agudas de sono.",
            createdAt: "2026-07-25"
        }
    ];

    // Consultas a partir do Mês de Agosto/2026
    const appointments = [
        // P001 - Ana Clara (Semanal - Segundas 09:00)
        { id: "A001", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-03", time: "09:00", service: "Psicoterapia Individual", value: 220.00, status: "Atendido", frequency: "Semanal", notes: "Sessão focada em respiração diafragmática." },
        { id: "A002", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-10", time: "09:00", service: "Psicoterapia Individual", value: 220.00, status: "Falta", frequency: "Semanal", notes: "Paciente justificou imprevisto de trabalho de última hora." },
        { id: "A003", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-17", time: "09:00", service: "Psicoterapia Individual", value: 220.00, status: "Atendido", frequency: "Semanal", notes: "Retomada dos exercícios cognitivos de reestruturação." },
        { id: "A004", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-24", time: "09:00", service: "Psicoterapia Individual", value: 220.00, status: "Agendado", frequency: "Semanal", notes: "Acompanhamento semanal." },
        { id: "A005", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-31", time: "09:00", service: "Psicoterapia Individual", value: 220.00, status: "Agendado", frequency: "Semanal", notes: "Fechamento do mês." },

        // P002 - Carlos Eduardo (Semanal - Terças 14:00)
        { id: "A006", patientId: "P002", patientName: "Carlos Eduardo Santos", date: "2026-08-04", time: "14:00", service: "Psicoterapia Individual", value: 250.00, status: "Cancelado", frequency: "Semanal", notes: "Desmarcado com 24h de antecedência devido a viagem corporativa." },
        { id: "A007", patientId: "P002", patientName: "Carlos Eduardo Santos", date: "2026-08-11", time: "14:00", service: "Psicoterapia Individual", value: 250.00, status: "Atendido", frequency: "Semanal", notes: "Discussão sobre burnout e limites de horário." },
        { id: "A008", patientId: "P002", patientName: "Carlos Eduardo Santos", date: "2026-08-18", time: "14:00", service: "Psicoterapia Individual", value: 250.00, status: "Agendado", frequency: "Semanal", notes: "Avaliação do diário de estresse." },
        { id: "A009", patientId: "P002", patientName: "Carlos Eduardo Santos", date: "2026-08-25", time: "14:00", service: "Psicoterapia Individual", value: 250.00, status: "Agendado", frequency: "Semanal", notes: "Sessão agendada." },

        // P003 - Juliana Mendes (Semanal - Quartas 10:30)
        { id: "A010", patientId: "P003", patientName: "Juliana Oliveira Mendes", date: "2026-08-05", time: "10:30", service: "Psicoterapia Individual", value: 220.00, status: "Atendido", frequency: "Semanal", notes: "Elaboração do luto e acolhimento emocional." },
        { id: "A011", patientId: "P003", patientName: "Juliana Oliveira Mendes", date: "2026-08-12", time: "10:30", service: "Psicoterapia Individual", value: 220.00, status: "Falta", frequency: "Semanal", notes: "Falta sem aviso prévio. Entrado em contato via WhatsApp." },
        { id: "A012", patientId: "P003", patientName: "Juliana Oliveira Mendes", date: "2026-08-19", time: "10:30", service: "Psicoterapia Individual", value: 220.00, status: "Agendado", frequency: "Semanal", notes: "Acompanhamento de humor." },
        { id: "A013", patientId: "P003", patientName: "Juliana Oliveira Mendes", date: "2026-08-26", time: "10:30", service: "Psicoterapia Individual", value: 220.00, status: "Agendado", frequency: "Semanal", notes: "Suporte emocional contínuo." },

        // P004 - Roberto Rocha (Semanal - Quintas 16:00)
        { id: "A014", patientId: "P004", patientName: "Roberto Almeida Rocha", date: "2026-08-06", time: "16:00", service: "Psicoterapia Individual", value: 240.00, status: "Atendido", frequency: "Semanal", notes: "Exposição gradual e psychoeducação do pânico." },
        { id: "A015", patientId: "P004", patientName: "Roberto Almeida Rocha", date: "2026-08-13", time: "16:00", service: "Psicoterapia Individual", value: 240.00, status: "Atendido", frequency: "Semanal", notes: "Paciente relatou redução nos episódios de ansiedade agudizada." },
        { id: "A016", patientId: "P004", patientName: "Roberto Almeida Rocha", date: "2026-08-20", time: "16:00", service: "Psicoterapia Individual", value: 240.00, status: "Agendado", frequency: "Semanal", notes: "Treino de dessensibilização." },
        { id: "A017", patientId: "P004", patientName: "Roberto Almeida Rocha", date: "2026-08-27", time: "16:00", service: "Psicoterapia Individual", value: 240.00, status: "Agendado", frequency: "Semanal", notes: "Acompanhamento de progresso." },

        // P005 - Beatriz Souza (Quinzenal - Segundas 15:00)
        { id: "A018", patientId: "P005", patientName: "Beatriz Souza Lima", date: "2026-08-03", time: "15:00", service: "Psicoterapia Individual", value: 220.00, status: "Atendido", frequency: "Quinzenal", notes: "Mapeamento de valores profissionais e habilidades." },
        { id: "A019", patientId: "P005", patientName: "Beatriz Souza Lima", date: "2026-08-17", time: "15:00", service: "Psicoterapia Individual", value: 220.00, status: "Atendido", frequency: "Quinzenal", notes: "Análise de currículo e objetivos de transição." },
        { id: "A020", patientId: "P005", patientName: "Beatriz Souza Lima", date: "2026-08-31", time: "15:00", service: "Psicoterapia Individual", value: 220.00, status: "Agendado", frequency: "Quinzenal", notes: "Sessão quinzenal." },

        // P006 - Lucas Costa (Quinzenal - Terças 10:00)
        { id: "A021", patientId: "P006", patientName: "Lucas Ferreira Costa", date: "2026-08-04", time: "10:00", service: "Psicoterapia Individual", value: 220.00, status: "Atendido", frequency: "Quinzenal", notes: "Análise funcional dos comportamentos de esquiva." },
        { id: "A022", patientId: "P006", patientName: "Lucas Ferreira Costa", date: "2026-08-18", time: "10:00", service: "Psicoterapia Individual", value: 220.00, status: "Agendado", frequency: "Quinzenal", notes: "Sessão quinzenal." },

        // P007 - Mariana Pires (Quinzenal - Quartas 15:30)
        { id: "A023", patientId: "P007", patientName: "Mariana Xavier Pires", date: "2026-08-05", time: "15:30", service: "Psicoterapia Individual", value: 230.00, status: "Atendido", frequency: "Quinzenal", notes: "Espaço de escuta sobre maternidade atípica e rede de apoio." },
        { id: "A024", patientId: "P007", patientName: "Mariana Xavier Pires", date: "2026-08-19", time: "15:30", service: "Psicoterapia Individual", value: 230.00, status: "Agendado", frequency: "Quinzenal", notes: "Estratégias de autocuidado e delegação de tarefas." },

        // P008 - Gabriel Alves (Quinzenal - Sextas 11:00)
        { id: "A025", patientId: "P008", patientName: "Gabriel Rodrigues Alves", date: "2026-08-07", time: "11:00", service: "Psicoterapia Individual", value: 250.00, status: "Atendido", frequency: "Quinzenal", notes: "Higiene do sono e manejo do estresse do trabalho." },
        { id: "A026", patientId: "P008", patientName: "Gabriel Rodrigues Alves", date: "2026-08-21", time: "11:00", service: "Psicoterapia Individual", value: 250.00, status: "Agendado", frequency: "Quinzenal", notes: "Relato de melhora no padrão de sono diário." }
    ];

    // Histórico de Evoluções Clínicas
    const evolutions = [
        { id: "E001", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-03", sessionNumber: 12, model: "TCC", mood: "Tranquilo / Calmo", content: "Paciente compareceu no horário. Relatou diminuição das dores somáticas causadas pela ansiedade. Trabalhamos reestruturação cognitiva sobre demandas profissionais." },
        { id: "E002", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-17", sessionNumber: 13, model: "TCC", mood: "Ansioso / Agitado", content: "Retorno após falta na semana anterior. Discutidos gatilhos de ansiedade associados a prazos e sobrecarga de trabalho. Reafirmado compromisso com diário de pensamentos." },
        { id: "E003", patientId: "P002", patientName: "Carlos Eduardo Santos", date: "2026-08-11", sessionNumber: 8, model: "Psicanálise", mood: "Exausto / Estressado", content: "Trabalhada a questão dos limites corporativos e a dificuldade em dizer 'não' para a diretoria da empresa. Identificada crença de valor atrelada exclusivamente a desempenho." },
        { id: "E004", patientId: "P003", patientName: "Juliana Oliveira Mendes", date: "2026-08-05", sessionNumber: 5, model: "Humanista", mood: "Triste / Deprimido", content: "Sessão focada na elaboração do luto. Paciente chorou abertamente durante o relato, demonstrando maior aceitação dos sentimentos de perda sem autojulgamento." },
        { id: "E005", patientId: "P004", patientName: "Roberto Almeida Rocha", date: "2026-08-06", sessionNumber: 15, model: "TCC", mood: "Estável / Eutímico", content: "Treino de respiração diafragmática e psychoeducação sobre a fisiologia do pânico. Paciente não apresentou novos ataques de pânico nos últimos 15 dias." },
        { id: "E006", patientId: "P004", patientName: "Roberto Almeida Rocha", date: "2026-08-13", sessionNumber: 16, model: "TCC", mood: "Motivado / Confiante", content: "Relatou ter conseguido utilizar transporte público sem crises. Reforçadas estratégias de enfrentamento e exposição graduada." },
        { id: "E007", patientId: "P005", patientName: "Beatriz Souza Lima", date: "2026-08-03", sessionNumber: 6, model: "Existencial", mood: "Tranquilo / Calmo", content: "Exploração dos dilemas éticos e vocacionais na carreira atual. Identificados valores prioritários para próxima transição profissional." },
        { id: "E008", patientId: "P005", patientName: "Beatriz Souza Lima", date: "2026-08-17", sessionNumber: 7, model: "Existencial", mood: "Tranquilo / Calmo", content: "Análise de opções de cursos e novos mercados. Paciente demonstra maior clareza nos objetivos de médio prazo." },
        { id: "E009", patientId: "P006", patientName: "Lucas Ferreira Costa", date: "2026-08-04", sessionNumber: 4, model: "Comportamental", mood: "Estável / Eutímico", content: "Mapeamento das situações interpessoais onde o paciente sente dificuldade de colocar limites claros." },
        { id: "E010", patientId: "P007", patientName: "Mariana Xavier Pires", date: "2026-08-05", sessionNumber: 9, model: "Humanista", mood: "Tranquilo / Calmo", content: "Acolhimento das angústias relacionadas à rotina de cuidados do filho. Trabalhada a culpa materna e a necessidade de tempo individual." },
        { id: "E011", patientId: "P008", patientName: "Gabriel Rodrigues Alves", date: "2026-08-07", sessionNumber: 11, model: "TCC", mood: "Exausto / Estressado", content: "Estabelecimento das regras da Higiene do Sono (restrição de telas antes de dormir e horários fixos)." }
    ];

    // Lançamentos Financeiros
    const transactions = [
        { id: "T001", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-03", description: "Sessão Psicoterapia - Ana Clara", category: "Sessão Individual", amount: 220.00, status: "pago", paymentMethod: "Pix" },
        { id: "T002", patientId: "P001", patientName: "Ana Clara Silva", date: "2026-08-17", description: "Sessão Psicoterapia - Ana Clara", category: "Sessão Individual", amount: 220.00, status: "pago", paymentMethod: "Pix" },
        { id: "T003", patientId: "P002", patientName: "Carlos Eduardo Santos", date: "2026-08-11", description: "Sessão Psicoterapia - Carlos Eduardo", category: "Sessão Individual", amount: 250.00, status: "pago", paymentMethod: "Transferência" },
        { id: "T004", patientId: "P003", patientName: "Juliana Oliveira Mendes", date: "2026-08-05", description: "Sessão Psicoterapia - Juliana", category: "Sessão Individual", amount: 220.00, status: "pago", paymentMethod: "Cartão" },
        { id: "T005", patientId: "P004", patientName: "Roberto Almeida Rocha", date: "2026-08-13", description: "Sessão Psicoterapia - Roberto", category: "Sessão Individual", amount: 240.00, status: "pendente", paymentMethod: "Boleto" },
        { id: "T006", patientId: "P005", patientName: "Beatriz Souza Lima", date: "2026-08-03", description: "Sessão Psicoterapia - Beatriz", category: "Sessão Individual", amount: 220.00, status: "pago", paymentMethod: "Pix" },
        { id: "T007", patientId: "P007", patientName: "Mariana Xavier Pires", date: "2026-08-05", description: "Sessão Psicoterapia - Mariana", category: "Sessão Individual", amount: 230.00, status: "pago", paymentMethod: "Pix" },
        { id: "T008", patientId: "P008", patientName: "Gabriel Rodrigues Alves", date: "2026-08-07", description: "Sessão Psicoterapia - Gabriel", category: "Sessão Individual", amount: 250.00, status: "pendente", paymentMethod: "Transferência" }
    ];

    return {
        therapist,
        doctor: therapist,
        patients,
        appointments,
        evolutions,
        transactions
    };
})();
