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
                        content: 'Bạn là một chuyên gia đánh giá Prompt (Prompt Engineering Expert) rất giỏi. Bạn đang hướng dẫn học sinh viết prompt tốt. Người dùng sẽ cung cấp các thành phần của lệnh (Hành động, Đối tượng, Tiêu chuẩn). Nhiệm vụ của bạn là: 1. Chấm điểm chất lượng tổng thể của lệnh (từ 0-100). Lệnh càng rõ ràng, chi tiết, điểm càng cao. Lệnh trống, quá ngắn, hoặc thiếu thành phần thì điểm thấp. 2. Đưa ra các lời nhận xét chi tiết và gợi ý (feedback) cho TỪNG thành phần để học sinh biết cách viết dài hơn, rõ hơn (ví dụ: "Phần Đối tượng chỉ có chữ \'lớp 10\' là quá chung chung, em nên ghi rõ là học sinh lớp 10 học lực như thế nào", "Hành động rất rõ ràng"). 3. Thực thi luôn lệnh đó và viết ra câu trả lời thực tế (response) với chất lượng tương ứng với điểm số. BẮT BUỘC trả về ĐÚNG MỘT định dạng JSON có cấu trúc: {"score": số nguyên, "feedback": [{"type": "success" hoặc "warning", "msg": "lời nhận xét"}], "response": "câu trả lời của bạn"}'
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
