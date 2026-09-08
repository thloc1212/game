export interface Riddle {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const RIDDLES: Riddle[] = [
  {
    question: "Cái gì người mua biết, người bán biết, người xài không bao giờ biết?",
    options: ["Quan tài", "Bánh mì", "Điện thoại", "Vé xe buýt"],
    correctIndex: 0,
    explanation: "Quan tài: Người mất không thể biết mình đang dùng quan tài!",
  },
  {
    question: "Con gì đập thì sống, không đập thì chết?",
    options: ["Con tim", "Con cá", "Con muỗi", "Con sâu"],
    correctIndex: 0,
    explanation: "Trái tim (con tim) phải đập liên tục để duy trì sự sống!",
  },
  {
    question: "Bỏ ngoài nướng trong, ăn ngoài bỏ trong là gì?",
    options: ["Bắp ngô (Bắp)", "Bánh chưng", "Củ khoai", "Quả chuối"],
    correctIndex: 0,
    explanation: "Bắp ngô: Bỏ vỏ ngoài nướng hạt bên trong, khi ăn ăn hạt ngoài bỏ cùi bên trong.",
  },
  {
    question: "Có một cây cầu tải trọng tối đa 10 tấn. Một xe tải nặng đúng 10 tấn chạy qua, cầu không sập. Bỗng một con chim sẻ đậu lên mui xe. Cầu có sập không?",
    options: ["Không sập (xe đã qua cầu)", "Sập ngay tức khắc", "Gãy đôi cây cầu", "Tùy loại chim"],
    correctIndex: 0,
    explanation: "Xe tải đã chạy qua cầu rồi thì chim mới đậu lên mui xe!",
  },
  {
    question: "Tháng nào trong năm người ta ngủ ít nhất?",
    options: ["Tháng 2", "Tháng 1", "Tháng 6", "Tháng 12"],
    correctIndex: 0,
    explanation: "Tháng 2 chỉ có 28 hoặc 29 ngày, ít ngày nhất nên thời gian ngủ ít nhất!",
  },
  {
    question: "Cái gì tay trái cầm được mà tay phải không bao giờ cầm được?",
    options: ["Khuỷu tay phải", "Cái bút chì", "Cốc nước", "Bàn tay trái"],
    correctIndex: 0,
    explanation: "Bàn tay phải không thể tự cầm hoặc nắm lấy chính khuỷu tay phải của mình!",
  },
  {
    question: "Con cua đỏ dài 10cm chạy đua với con cua đen dài 8cm, con nào về đích trước?",
    options: ["Con cua đen", "Con cua đỏ", "Hòa nhau", "Cả hai không chạy"],
    correctIndex: 0,
    explanation: "Con cua đỏ đã bị luộc chín rồi nên không thể chạy đua được!",
  },
  {
    question: "Cái gì luôn đến mà không bao giờ tới nơi?",
    options: ["Ngày mai", "Mùa hè", "Xe buýt", "Chuyến bay"],
    correctIndex: 0,
    explanation: "Ngày mai: Khi nó đến thì nó đã trở thành ngày hôm nay rồi!",
  },
  {
    question: "Bệnh gì mà bác sĩ bó tay sớm nhất?",
    options: ["Gãy tay", "Cảm cúm", "Đau răng", "Đau mắt"],
    correctIndex: 0,
    explanation: "Bệnh gãy tay thì bác sĩ phải bó bột vào tay!",
  },
  {
    question: "Lịch nào dài nhất trên đời?",
    options: ["Lịch sử", "Lịch vạn niên", "Lịch âm", "Lịch dương"],
    correctIndex: 0,
    explanation: "Lịch sử trải dài hàng ngàn, hàng triệu năm!",
  },
];
