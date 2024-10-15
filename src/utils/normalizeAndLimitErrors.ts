
// Функция для нормализации и ограничения длины ошибок
const normalizeAndLimitErrors = (data: any, maxLength: number = 500): Record<string, string[]> => {
    const normalizedErrors: Record<string, string[]> = {};

    for (const key in data) {
        let messages = data[key];

        if (!Array.isArray(messages)) {
            if (typeof messages === 'string') {
                messages = [messages];
            } else {
                messages = ['Unknown error'];
            }
        }

        // Ограничение длины каждого сообщения
        messages = messages.map((msg: any) =>
            typeof msg === 'string' ? (msg.length > maxLength ? msg.slice(0, maxLength) + '...' : msg) : 'Invalid error format'
        );

        normalizedErrors[key] = messages;
    }

    return normalizedErrors;
};

export default normalizeAndLimitErrors;