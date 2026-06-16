export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chưa cài đặt biến môi trường GROQ_API_KEY trên Vercel' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ 
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Bạn là một chuyên gia đánh giá Prompt, đang dạy học sinh cấp 2. Học sinh cung cấp lệnh theo các thành phần (Hành động, Đối tượng, Tiêu chuẩn). Nhiệm vụ: 1. Chấm điểm (0-100) theo mức độ chi tiết của prompt. 2. Đưa ra nhận xét cho TỪNG thành phần. BẮT BUỘC: Nếu thành phần nào bị thiếu hoặc chung chung, bạn PHẢI đưa ra VÍ DỤ CỤ THỂ, TRỰC QUAN để học sinh biết nên viết thêm gì (Ví dụ: "Phần Đối tượng \'lớp 10\' còn chung chung. Em hãy thử viết cụ thể hơn như: \'Học sinh lớp 10 đang học bài chuyển động thẳng đều, cần ví dụ thực tế dễ hiểu\'"). Đừng chỉ nói "cần chi tiết hơn" mà không cho ví dụ. 3. Trả lời yêu cầu của học sinh (response) với chất lượng tương xứng với lệnh học sinh viết. BẮT BUỘC trả về JSON có cấu trúc: {"score": số nguyên, "feedback": [{"type": "success" hoặc "warning", "msg": "Lời nhận xét BẮT BUỘC KÈM VÍ DỤ CỤ THỂ để học sinh copy"}], "response": "câu trả lời của AI"}'
                    },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Lỗi từ Groq API');
        }

        const jsonStr = data.choices[0].message.content;
        const parsedData = JSON.parse(jsonStr);

        return res.status(200).json(parsedData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
