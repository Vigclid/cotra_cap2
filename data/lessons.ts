/**
 * Dữ liệu 10 bài học Ngữ Văn 6 (Kết nối tri thức) – nguồn chung cho Roadmap và Lesson Panel.
 * Server cũng đọc file này để tra câu hỏi theo chỉ số, client không gửi nội dung câu hỏi lên.
 */

export type LessonText = {
  /** Định dạng "Tên văn bản (Tác giả)" – phần trong ngoặc được hiển thị là tác giả. */
  name: string;
  /** Toàn văn bài đọc, mỗi phần tử là một đoạn văn. Mảng rỗng → cột Sách giáo khoa báo "đang cập nhật". */
  fullText: string[];
  questions: string[];
};

export type LessonQuote = { text: string; author: string };

export type Lesson = {
  id: number;
  title: string;
  theme: string;
  quote: LessonQuote;
  /** Yêu cầu cần đạt của chặng học. */
  objectives: string[];
  /** Ảnh minh hoạ lớn (đường dẫn trong /public hoặc URL). Bỏ trống → hiển thị placeholder. */
  heroImage?: string;
  texts: LessonText[];
};

export const lessonsData: Lesson[] = [
  {
    id: 1,
    title: "Bài 1: Tôi và các bạn",
    theme: "Truyện đồng thoại",
    quote: {
      text: "Ở đời mà có thói hung hăng bậy bạ, có óc mà không biết nghĩ, sớm muộn rồi cũng mang vạ vào mình đấy.",
      author: "Dế Choắt – Bài học đường đời đầu tiên (Tô Hoài)",
    },
    objectives: [
      "Nhận biết đặc điểm của truyện đồng thoại: nhân vật là loài vật được nhân hoá.",
      "Xác định ngôi kể thứ nhất và tác dụng của lời người kể chuyện.",
      "Nhận xét tính cách nhân vật qua hình dáng, lời nói, hành động.",
      "Biết trân trọng tình bạn, cư xử khiêm tốn và có trách nhiệm.",
    ],
    texts: [
      {
        name: "Bài học đường đời đầu tiên (Tô Hoài)",
        // Văn bản giả lập để test giao diện – thay bằng trích đoạn SGK chính thức.
        fullText: [
          "Bởi tôi ăn uống điều độ và làm việc có chừng mực nên tôi chóng lớn lắm. Chẳng bao lâu, tôi đã trở thành một chàng dế thanh niên cường tráng. Đôi càng tôi mẫm bóng. Những cái vuốt ở chân, ở khoeo cứ cứng dần và nhọn hoắt.",
          "Thỉnh thoảng, muốn thử sự lợi hại của những chiếc vuốt, tôi co cẳng lên, đạp phanh phách vào các ngọn cỏ. Những ngọn cỏ gãy rạp, y như có nhát dao vừa lia qua. Đôi cánh tôi, trước kia ngắn hủn hoằn bây giờ thành cái áo dài kín xuống tận chấm đuôi. Mỗi khi tôi vũ lên, đã nghe tiếng phành phạch giòn giã. Lúc tôi đi bách bộ thì cả người tôi rung rinh một màu nâu bóng mỡ soi gương được và rất ưa nhìn. Đầu tôi to ra và nổi từng tảng, rất bướng. Hai cái răng đen nhánh lúc nào cũng nhai ngoàm ngoạp như hai lưỡi liềm máy làm việc. Sợi râu tôi dài và uốn cong một vẻ rất đỗi hùng dũng. Tôi lấy làm hãnh diện với bà con về cặp râu ấy lắm. Cứ chốc chốc tôi lại trịnh trọng và khoan thai đưa cả hai chân lên vuốt râu.",
          "Tôi đi đứng oai vệ. Mỗi bước đi, tôi làm điệu dún dẩy các khoeo chân, rung lên rung xuống hai chiếc râu. Cho ra kiểu cách con nhà võ. Tôi tợn lắm. Dám cà khịa với tất cả mọi bà con trong xóm. Khi tôi to tiếng thì ai cũng nhịn, không ai đáp lại. Bởi vì quanh quẩn, ai cũng quen thuộc mình cả. Không nói, có lẽ họ nể hơn là sợ. Nhưng tôi lại tưởng thế là không ai dám ho he. Ấy vậy, tôi cho là tôi giỏi. Những gã xốc nổi thường lầm cử chỉ ngông cuồng là tài ba. Tôi đã quát mấy chị Cào Cào ngụ ngoài đầu bờ, khiến mỗi lần thấy tôi đi qua, các chị phải núp khuôn mặt trái xoan dưới nhánh cỏ, chỉ dám đưa mắt lên nhìn trộm. Thỉnh thoảng, tôi ngứa chân đá một cái, ghẹo anh Gọng Vó lấm láp vừa ngơ ngác dưới đầm lên. Tôi càng tưởng tôi là tay ghê gớm, có thể sắp đứng đầu thiên hạ rồi.",
          "Chao ôi, có biết đâu rằng: hung hăng, hống hách láo chỉ tổ đem thân mà trả nợ những cử chỉ ngu dại của mình thôi. Tôi đã phải trải cảnh như thế. Thoát nạn rồi, mà còn ân hận quá, ân hận mãi. Thế mới biết, nếu đã trót không suy tính, lỡ xảy ra những việc dại dột, dù về sau có hối cũng không thể làm lại được.",
          "Câu chuyện ân hận đầu tiên mà tôi ghi nhớ suốt đời.",
          "Bên hàng xóm tôi có cái hang của Dế Choắt. Dế Choắt là tên tôi đã đặt cho nó một cách chế giễu và trịch thượng thế. Choắt nọ có lẽ cũng trạc tuổi tôi. Nhưng vì Choắt bẩm sinh yếu đuối nên tôi coi thường và gã cũng sợ tôi lắm.",
          "Cái chàng Dế Choắt, người gầy gò và dài lêu nghêu như một gã nghiện thuốc phiện. Đã thanh niên rồi mà cánh chỉ ngắn củn đến giữa lưng, hở cả mạng sườn như người cởi trần mặc áo gi-lê. Đôi càng bè bè, nặng nề, trông đến xấu. Râu ria gì mà cụt có một mẩu, và mặt mũi thì lúc nào cũng ngẩn ngẩn ngơ ngơ. Đã vậy, tính nết lại ăn xổi ở thì (thật chỉ vì ốm đau luôn, không làm được), có một cái hang ở cũng chỉ bới nông sát mặt đất, không biết đào sâu rồi khoét ra nhiều ngách như hang tôi.",
          "Một hôm, tôi sang chơi, thấy trong nhà luộm thuộm, bề bộn, tôi bảo: - Sao chú mày sinh sống cẩu thả quá như thế! Nhà cửa đâu mà tuềnh toàng. Ngộ có kẻ nào đến phá thì thật chú chết ngay đuôi! Này thử xem: khi chú chui vào tổ, lưng chú phải lồm cồm đụng sát lên tận mặt đất, làm cho ai trên vệ cỏ nhìn sang cũng biết chú đương đi đứng chỗ nào trong tổ. Phỏng thử có thằng chim Cắt nó nhòm thấy, nó tưởng mồi, nó mổ một phát, nhất định trúng giữa lưng chú, thì chú có mà đi đời! Ôi thôi, chú mày ơi! Chú mày có lớn mà chẳng có khôn.",
          "Ngẫm ra thì tôi chỉ nói lấy sướng miệng tôi. Còn Dế Choắt than thở thế nào, tôi cũng không để tai. Hồi ấy, tôi có tính tự đắc, cứ miệng mình nói tai mình nghe chứ không biết nghe ai, thậm chí cũng chẳng để ý có ai nghe mình không.",
          "Dế Choắt trả lời tôi bằng một giọng rất buồn rầu: - Thưa anh, em cũng muốn khôn nhưng khôn không được. Đụng đến việc là em thở rồi, không còn hơi sức đâu mà đào bới nữa. Lắm khi em cũng nghĩ nỗi nhà cửa như thế này là nguy hiểm, nhưng em nghèo sức quá, em đã nghĩ ròng rã hàng mấy tháng cũng không biết làm thế nào. Hay là bây giờ em nghĩ thế này... Song anh có cho phép nói em mới dám nói...",
          "Rồi Dế Choắt loanh quanh, băn khoăn. Tôi phải bảo: - Được, chú mình cứ nói thẳng thừng ra nào.",
          "Dế Choắt nhìn tôi mà rằng: - Anh đã nghĩ thương em như thế thì hay là anh đào giúp cho em một cái ngách sang bên nhà anh, phòng khi tắt lửa tối đèn có đứa nào đến bắt nạt thì em chạy sang...",
          "Chưa nghe hết câu, tôi đã hếch răng lên, xì một hơi rõ dài. Rồi, với điệu bộ khinh khỉnh, tôi mắng: - Hức! Thông ngách sang nhà ta? Dễ nghe nhỉ! Chú mày hôi như cú mèo thế này, ta nào chịu được. Thôi, im cái điệu hát mưa dầm sùi sụt ấy đi. Đào tổ nông thì cho chết!",
          "Tôi về, không một chút bận tâm.",
          "Một buổi chiều, tôi ra đứng cửa hang như mọi khi, xem hoàng hôn xuống. Mấy hôm nọ, trời mưa lớn, trên những hồ ao quanh bãi trước mặt, nước dâng trắng mênh mông. Nước đầy và nước mới thì cua cá cũng tấp nập xuôi ngược, thế là bao nhiêu cò, sếu, vạc, cốc, le, sâm cầm, vịt trời, bồ nông, mòng két ở các bãi sông xơ xác tận đâu cũng bay cả về vùng nước mới để kiếm mồi. Suốt ngày, họ cãi cọ om bốn góc đầm, có khi chỉ vì tranh một mồi tép. Có những anh Cò gầy vêu vao ngày ngày bì bõm lội bùn tím cả chân mà vẫn hếch mỏ, chẳng được miếng nào. Khổ quá, những kẻ yếu đuối, vật lộn cật lực thế mà cũng không sống nổi. Tôi đứng trong bóng nắng chiều toả xuống ánh nước cửa hang mà suy nghĩ việc đời như thế.",
          "Bỗng thấy chị Cốc từ dưới mặt nước bay lên, đến đậu gần hang tôi, cách có mấy bước. Chừng rớ được món nào, vừa chén xong, chị ta tìm đến đứng chỗ mát rỉa lông, rỉa cánh và chùi mép.",
          "Tính tôi hay nghịch ranh. Chẳng bận đến tôi, tôi cũng nghĩ mưu trêu chị Cốc. Tôi cất tiếng gọi Dế Choắt. Nghe tiếng thưa, tôi hỏi: - Chú mình muốn cùng tớ đùa vui không? - Đùa trò gì? Em đương lên cơn hen đây, hừ hừ... - Đùa chơi một tí. - Hừ... hừ... Cái gì thế? - Con mụ Cốc kia kìa.",
          "Dế Choắt ra cửa, hé mắt nhìn chị Cốc. Rồi hỏi tôi: - Chị Cốc béo xù đứng trước cửa nhà ta ấy hả? - Ừ. - Thôi thôi... hừ hừ... Em xin vái cả sáu tay. Anh đừng trêu vào... Anh phải sợ...",
          "Tôi quắc mắt: - Sợ gì? Mày bảo tao sợ cái gì? Mày bảo tao còn biết sợ ai hơn tao nữa!",
          "- Thưa anh, thế thì,... hừ hừ... em xin sợ. Mời anh cứ đùa một mình thôi.",
          "Tôi lại mắng Dế Choắt và bảo: - Giương mắt ra xem tao trêu con mụ Cốc đây này.",
          "Tôi rình đến lúc chị Cốc rỉa cánh quay đầu lại phía cửa tổ tôi, tôi cất giọng véo von: Cái Cò, cái Vạc, cái Nông, / Ba cái cùng béo, vặt lông cái nào? / Vặt lông cái Cốc cho tao, / Tao nấu, tao nướng, tao xào, tao ăn.",
          "Chị Cốc thoạt nghe tiếng hát từ trong đất văng vẳng lên, không hiểu như thế nào, giật nảy hai đầu cánh, muốn bay. Đến khi định thần lại, chị mới trợn tròn mắt, giương cánh lên như sắp đánh nhau. Chị lò dò về phía cửa hang tôi, hỏi: - Đứa nào cạnh khoé gì tao thế? Đứa nào cạnh khoé gì tao thế?",
          "Tôi chui tọt ngay vào hang, lên giường nằm khểnh bắt chân chữ ngũ. Bụng nghĩ thú vị: “Mày tức thì mày cứ tức, mày ghè vỡ đầu mày ra cho nhỏ đi, nhỏ đến đâu thì mày cũng không chui nổi vào tổ tao đâu!”.",
          "Một tai hoạ đến mà đứa ích kỉ thì không thể biết trước được. Đó là: không trông thấy tôi, nhưng chị Cốc đã trông thấy Dế Choắt đang loay hoay trong cửa hang. Chị Cốc liền quát lớn: - Mày nói gì? - Lạy chị, em nói gì đâu! Rồi Dế Choắt lủi vào. - Chối hả? Chối này! Chối này!",
          "Mỗi câu “Chối này” chị Cốc lại giáng một mỏ xuống. Mỏ Cốc như cái dùi sắt, chọc xuyên cả đất. Rúc trong hang mà bị trúng hai mỏ, Choắt quẹo xương sống lăn ra kêu váng. Núp tận đáy đất mà tôi cũng khiếp, nằm im thít. Như đã hả cơn tức, chị Cốc đứng rỉa lông cánh một lát nữa rồi lại bay là xuống đầm nước, không chút để ý đến cảnh khổ đau vừa gây ra.",
          "Biết chị Cốc đi rồi, tôi mới mon men bò lên. Trông thấy tôi, Dế Choắt khóc thảm thiết.",
          "Tôi hỏi một câu ngớ ngẩn: - Sao? Sao?",
          "Choắt không dậy được nữa, nằm thoi thóp. Thấy thế tôi hốt hoảng quỳ xuống, nâng đầu Choắt lên mà than rằng: - Nào tôi đâu biết cơ sự lại ra nông nỗi này! Tôi hối lắm. Tôi hối hận lắm! Anh mà chết là chỉ tại cái tội ngông cuồng dại dột của tôi. Tôi biết làm thế nào bây giờ?",
          "Tôi không ngờ Dế Choắt nói với tôi một câu như thế này: - Thôi, tôi ốm yếu quá rồi, chết cũng được. Nhưng trước khi nhắm mắt, tôi khuyên anh: ở đời mà có thói hung hăng bậy bạ, có óc mà không biết nghĩ, sớm muộn rồi cũng mang vạ vào mình đấy.",
          "Thế rồi Dế Choắt tắt thở. Tôi thương lắm. Vừa thương vừa ăn năn tội mình. Giá tôi không trêu chị Cốc thì đâu đến nỗi Choắt việc gì. Cả tôi nữa, nếu không nhanh chân chạy vào hang thì tôi cũng chết toi rồi.",
          "Tôi đem xác Dế Choắt đến chôn vào một vùng cỏ bùm tum. Tôi đắp thành nấm mộ to. Tôi đứng lặng giờ lâu, nghĩ về bài học đường đời đầu tiên."
        ],
        questions: [
          "Câu chuyện được kể bằng lời của nhân vật nào? Kể theo ngôi thứ mấy?",
          "Dế Mèn đã nói gì khi sang thăm nhà Dế Choắt và khi Dế Choắt nhờ giúp đỡ? Những lời nói đó thể hiện thái độ gì của Dế Mèn?",
        ],
      },
      {
        name: "Nếu cậu muốn có một người bạn... (Ăng-toan đơ Xanh-tơ Ê-xu-pe-ri)",
        fullText: [
          "Thế rồi một con cáo xuất hiện: - Xin chào - con cáo nói. - Xin chào - hoàng tử bé lịch sự trả lời rồi quay người lại nhưng không nhìn thấy gì. - Mình ở đây - giọng nói vang lên - dưới cây táo... - Bạn là ai? - Hoàng tử bé hỏi. - Bạn dễ thương quá... - Mình là cáo - con cáo trả lời. - Lại đây chơi với mình đi - hoàng tử bé đề nghị nó. - Mình buồn quá... - Mình không thể chơi với bạn được - con cáo nói. - Mình chưa được cảm hoá.",
          "- À! Xin lỗi! - Hoàng tử bé thốt lên. Nhưng sực nhớ ra, cậu hỏi lại: - “Cảm hoá” nghĩa là gì? - Bạn không phải người ở đây - con cáo nói - bạn đi tìm gì vậy? - Mình đi tìm con người. - Hoàng tử bé nói. - “Cảm hoá” nghĩa là gì? - Con người - con cáo nói - họ có súng và họ đi săn. Thật là phiền toái! Họ còn nuôi gà nữa. Đó là chuyện được nhất ở họ. Bạn có tìm gà không? - Không, mình đi tìm bạn bè. “Cảm hoá” nghĩa là gì? - Đó là thứ bị lãng quên lâu lắm rồi. Nó có nghĩa là “làm cho gần gũi hơn”... - Làm cho gần gũi hơn? - Chứ sao - con cáo lên giọng. - Bạn đối với mình mới chỉ là một cậu bé giống như cả trăm nghìn cậu bé. Và mình không cần đến bạn. Còn bạn cũng chẳng cần gì đến mình. Mình đối với bạn chỉ là một con cáo giống như cả trăm nghìn con cáo. Nhưng, nếu bạn cảm hoá mình, tụi mình sẽ cần đến nhau. Lúc đó bạn đối với mình sẽ là duy nhất trên đời. Mình đối với bạn sẽ là duy nhất trên đời...",
          "- Mình bắt đầu hiểu rồi. Có một bông hoa... Mình nghĩ là nó đã cảm hoá mình... - Có thể lắm. Trên Trái Đất người ta thấy đủ thứ chuyện... - Ồ! Không phải trên Trái Đất - hoàng tử bé nói. Con cáo tỏ ra rất tò mò: - Trên một hành tinh khác? - Đúng vậy. - Có thợ săn trên hành tinh đó không? - Không. - Chuyện này, đúng là thú vị! Còn gà? - Không. - Chẳng có gì là hoàn hảo - con cáo thở dài. Nhưng rồi nó quay lại với ý nghĩ lúc nãy: - Cuộc sống của mình thật đơn điệu. Mình săn gà, con người săn mình. Mọi con gà đều giống nhau, mọi con người đều giống nhau. Cho nên mình hơi chán. Bởi vậy, nếu bạn cảm hoá mình, xem như đời mình đã được chiếu sáng. Mình sẽ biết thêm một tiếng chân khác hẳn mọi bước chân khác.",
          "Những bước chân khác chỉ khiến mình trốn vào lòng đất. Còn bước chân của bạn sẽ gọi mình ra khỏi hang, như là tiếng nhạc. Và nhìn xem! Bạn thấy không, cánh đồng lúa mì đằng kia? Mình không ăn bánh mì. Lúa mì chả có ích gì cho mình. Những đồng lúa mì chẳng gợi nhớ gì cho mình cả. Mà như vậy thì buồn quá! Nhưng bạn có mái tóc vàng óng. Nếu bạn cảm hoá mình thì thật là tuyệt vời! Lúa mì vàng óng ả sẽ làm mình nhớ đến bạn. Và mình sẽ thấy thích tiếng gió trên đồng lúa mì... Con cáo ngừng lời và nhìn hoàng tử bé chăm chú. Nó nói: - Bạn làm ơn... cảm hoá mình đi!",
          "- Mình muốn lắm - hoàng tử bé trả lời - nhưng mình không có thời gian. Mình còn phải đi kiếm bạn bè và tìm hiểu nhiều thứ. - Người ta chỉ hiểu những gì họ đã cảm hoá. [...] Nếu muốn có một người bạn, hãy cảm hoá mình đi! - Cần phải làm sao? - Hoàng tử bé hỏi. - Cần phải rất kiên nhẫn - con cáo trả lời. - Trước tiên bạn ngồi xa mình một chút, như thế, trên cỏ. Mình sẽ liếc nhìn bạn còn bạn thì không nói gì cả. Lời nói là nguồn gốc của mọi sự hiểu lầm. Nhưng mỗi ngày, bạn có thể ngồi xích lại gần hơn...",
          "[...] Cứ thế, hoàng tử bé cảm hoá con cáo. Khi gần đến lúc phải ra đi, con cáo nói: - A!... Mình sẽ khóc mất. - Lỗi do bạn đó - hoàng tử bé nói - mình không muốn làm bạn đau lòng chút nào, nhưng bạn lại muốn mình cảm hoá bạn... - Tất nhiên rồi - con cáo nói. - Nhưng bạn sẽ khóc - hoàng tử bé nói. - Tất nhiên rồi - con cáo nói. - Vậy thì bạn chẳng được gì cả. - Mình được chứ - con cáo nói - bởi vì còn có màu lúa mì.",
          "Sau đó nó nói thêm: - Hãy thăm lại vườn hoa hồng đi! Bạn sẽ hiểu rằng bông hoa của bạn là duy nhất trên đời. Rồi khi bạn quay lại vĩnh biệt mình, mình sẽ tặng bạn một bí mật làm quà. Hoàng tử bé đi thăm lại vườn hoa hồng: - Các bạn chẳng giống bông hồng của tôi chút nào, các bạn chưa là gì cả - cậu nói với chúng. - Chẳng ai cảm hoá các bạn và các bạn chẳng cảm hoá ai. Các bạn giống như bạn cáo của tôi ngày trước. Hồi đó bạn ấy chỉ là một con cáo như cả trăm ngàn con khác. Nhưng tôi đã biến bạn ấy thành bạn của tôi, và bây giờ bạn ấy trở thành duy nhất trên đời.",
          "[...] Rồi cậu quay lại chỗ con cáo: - Vĩnh biệt - cậu nói... - Vĩnh biệt - con cáo nói. - Đây là bí mật của mình. Rất đơn giản: người ta chỉ thấy rõ với trái tim. Điều cốt lõi vô hình trong mắt trần. - Điều cốt lõi vô hình trong mắt trần - hoàng tử bé lặp lại, để cho nhớ. - Chính thời gian mà bạn bỏ ra cho bông hồng của bạn đã khiến bông hồng của bạn trở nên quan trọng đến thế. - Chính thời gian mà mình bỏ ra cho bông hồng của mình... - Hoàng tử bé lặp lại, để cho nhớ. - Con người đã quên mất sự thật này - con cáo nói. - Nhưng bạn thì không được quên. Bạn có trách nhiệm mãi mãi với những gì bạn đã cảm hoá. Bạn có trách nhiệm với bông hồng của bạn... - Mình có trách nhiệm với bông hồng của mình... - Hoàng tử bé lặp lại, để cho nhớ."
        ],
        questions: [
          "Từ 'cảm hoá' xuất hiện bao nhiêu lần trong đoạn trích? Em hiểu 'cảm hoá' nghĩa là gì?",
          "Nếu được hoàng tử bé cảm hoá, cuộc sống của cáo sẽ thay đổi như thế nào?",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Bài 2: Gõ cửa trái tim",
    theme: "Thơ có yếu tố tự sự",
    quote: {
      text: "Con lăn, lăn, lăn mãi rồi sẽ cười vang vỡ tan vào lòng mẹ.",
      author: "Mây và sóng (R. Ta-go)",
    },
    objectives: [
      "Nhận biết yếu tố tự sự và miêu tả trong thơ.",
      "Chỉ ra đặc điểm của thơ về số tiếng, vần, nhịp và hình ảnh.",
      "Cảm nhận tình cảm gia đình, tình mẹ con được thể hiện qua bài thơ.",
      "Viết đoạn văn ghi lại cảm xúc về một bài thơ.",
    ],
    texts: [
      {
        name: "Mây và sóng (Ra-bin-đơ-ra-nát Ta-go)",
        fullText: [
          "Mẹ ơi, trên mây có người gọi con:",
          "“Bọn tớ chơi từ khi thức dậy cho đến lúc chiều tà. Bọn tớ chơi với bình minh vàng, bọn tớ chơi với vầng trăng bạc”.",
          "Con hỏi: “Nhưng làm thế nào mình lên đó được?”.",
          "Họ đáp: “Hãy đến nơi tận cùng trái đất, đưa tay lên trời, cậu sẽ được nhấc bổng lên tận tầng mây”.",
          "“Mẹ mình đang đợi ở nhà” – con bảo – “Làm sao có thể rời mẹ mà đến được?”.",
          "Thế là họ mỉm cười bay đi.",
          "Nhưng con biết có trò chơi thú vị hơn, mẹ ạ.",
          "Con là mây và mẹ sẽ là trăng.",
          "Hai bàn tay con ôm lấy mẹ, và mái nhà ta sẽ là bầu trời xanh thẳm.",
          "Trong sóng có người gọi con:",
          "“Bọn tớ ca hát từ sáng sớm cho đến hoàng hôn. Bọn tớ ngao du nơi này nơi nọ mà không biết từng đến nơi nao”.",
          "Con hỏi: “Nhưng làm thế nào mình ra ngoài đó được?”.",
          "Họ nói: “Hãy đến rìa biển cả, nhắm nghiền mắt lại, cậu sẽ được làn sóng nâng đi”.",
          "Con bảo: “Buổi chiều mẹ luôn muốn mình ở nhà, làm sao có thể rời mẹ mà đi được?”.",
          "Thế là họ mỉm cười, nhảy múa lướt qua.",
          "Nhưng con biết trò chơi khác hay hơn.",
          "Con là sóng và mẹ sẽ là bến bờ kì lạ,",
          "Con lăn, lăn, lăn mãi rồi sẽ cười vang vỡ tan vào lòng mẹ.",
          "Và không ai trên thế gian này biết mẹ con ta ở chốn nào."
        ],
        questions: [
          "Vì sao em bé từ chối lời mời gọi của những người 'trên mây' và 'trong sóng'?",
          "Em bé đã sáng tạo ra những trò chơi gì? Em cảm nhận được gì về tình cảm mẹ con qua đó?",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Bài 3: Yêu thương và chia sẻ",
    theme: "Truyện ngắn",
    quote: {
      text: "Chỉ sống thôi thì chưa đủ, ta còn cần có ánh nắng, tự do và một bông hoa nhỏ.",
      author: "H. C. An-đéc-xen",
    },
    objectives: [
      "Nhận biết cốt truyện, nhân vật, lời người kể chuyện và lời nhân vật.",
      "Phân tích chi tiết tiêu biểu để hiểu tâm trạng, ước mơ của nhân vật.",
      "Nêu được chủ đề của truyện: lòng yêu thương, sự sẻ chia.",
      "Biết đồng cảm và giúp đỡ những người có hoàn cảnh khó khăn.",
    ],
    texts: [
      {
        name: "Cô bé bán diêm (An-đéc-xen)",
        fullText: [
          "Rét dữ dội, tuyết rơi. Trời đã tối hẳn. Đêm nay là đêm giao thừa.",
          "Giữa trời đông giá rét, một em gái nhỏ đầu trần, chân đi đất, đang dò dẫm trong đêm tối.",
          "Lúc ra khỏi nhà em có đi giày vải, nhưng giày vải phỏng có tác dụng gì kia chứ!",
          "Giày ấy của mẹ em để lại, rộng quá, em đã liên tiếp làm văng mất cả hai chiếc khi em chạy qua đường, vào lúc hai chiếc xe ngựa đang phóng nước đại.",
          "Chiếc thứ nhất bị xe song mã nghiến, rồi dính theo tuyết vào bánh xe; thế là mất hút. Còn chiếc thứ hai, một thằng bé lượm được, cười sằng sặc, đem tung lên trời. Nó còn nói to với em bé rằng nó sẽ giữ chiếc giày để làm nôi cho con chó sau này.",
          "Thế rồi em phải đi đất, chân em đỏ ửng lên, rồi tím bầm lại vì rét.",
          "Chiếc tạp dề cũ kĩ của em đựng đầy diêm và tay em còn cầm thêm một bao.",
          "Em cố kiếm một nơi có nhiều người qua lại. Nhưng trời rét quá, khách qua đường đều rảo bước rất nhanh, chẳng ai đoái hoài đến lời chào hàng của em. Suốt ngày em chẳng bán được gì cả và chẳng ai bố thí cho em chút đỉnh. Em bé đáng thương, bụng đói rét vẫn lang thang trên đường. Bông tuyết bám đầy trên mái tóc dài xoã thành từng búp trên lưng em, em cũng không để ý.",
          "Cửa sổ mọi nhà đều sáng rực ánh đèn và trong phố sực nức mùi ngỗng quay. Chả là đêm giao thừa mà! Em tưởng nhớ lại năm xưa, khi bà nội hiền hậu của em còn sống, em cũng được đón giao thừa ở nhà. Nhưng Thần Chết đã đến cướp bà em đi mất, gia sản tiêu tán và gia đình em đã phải rời ngôi nhà xinh xắn có dây trường xuân leo quanh, nơi em đã sống những ngày đầm ấm, để chui rúc trong một xó tối tăm, luôn luôn nghe những lời mắng nhiếc, chửi rủa.",
          "Em ngồi nép trong một góc tường, giữa hai ngôi nhà, một cái xây lùi lại một chút.",
          "Em thu đôi chân vào người, nhưng mỗi lúc em càng thấy rét buốt hơn. Tuy nhiên, em không thể nào về nhà nếu không bán được ít bao diêm, hay không ai bố thí cho một đồng xu nào đem về; nhất định là cha em sẽ đánh em. Vả lại ở nhà cũng rét thế thôi. Cha con em ở trên gác, sát mái nhà, và mặc dầu đã nhét giẻ rách vào các kẽ hở lớn trên vách, gió vẫn thổi rít vào trong nhà. Lúc này đôi bàn tay em đã cứng đờ ra.",
          "Chà! Giá quẹt một que diêm lên mà sưởi cho đỡ rét một chút nhỉ? Cuối cùng em đánh liều quẹt một que. Diêm bén lửa thật là nhạy. Ngọn lửa lúc đầu xanh lam, dần dần biếc đi, trắng ra, rực hồng lên quanh que gỗ, sáng chói trông đến vui mắt. Em hơ đôi tay trên que diêm sáng rực như than hồng. Chà! Ánh sáng kì diệu làm sao! Em tưởng chừng như đang ngồi trước một lò sưởi bằng sắt có những hình nổi bằng đồng bóng nhoáng. Trong lò, lửa cháy nom đến vui mắt và toả ra hơi nóng dịu dàng. Thật là dễ chịu! Đôi bàn tay em hơ trên ngọn lửa, bên tay cầm diêm, ngón cái nóng bỏng lên. Chà! Khi tuyết phủ kín mặt đất, gió bấc thổi vun vút mà được ngồi hàng giờ như thế, trong đêm đông rét buốt, trước một lò sưởi thì khoái biết bao!",
          "Em vừa duỗi chân ra sưởi thì lửa vụt tắt, lò sưởi biến mất. Em ngồi đó, tay cầm que diêm đã tàn hẳn. Em bần thần cả người và chợt nghĩ ra rằng cha của em đã giao cho em đi bán diêm. Đêm nay, về nhà thế nào cũng bị cha mắng.",
          "Em quẹt que diêm thứ hai, diêm cháy và sáng rực lên. Bức tường như biến thành một tấm rèm bằng vải màn. Em nhìn thấu vào tận trong nhà. Bàn ăn đã dọn, khăn trải trắng tinh, trên bàn bày toàn bát đĩa bằng sứ quý giá và có cả một con ngỗng quay. Nhưng điều kì diệu nhất là ngỗng ta nhảy ra khỏi đĩa và mang cả dao ăn, phóng sết, cắm trên lưng, tiến về phía em bé.",
          "Rồi... que diêm vụt tắt; trước mặt em chỉ còn là những bức tường dầy đặc và lạnh lẽo.",
          "Thực tế đã thay thế cho mộng mị: chẳng có bàn ăn thịnh soạn nào cả, mà chỉ có phố xá vắng teo, lạnh buốt, tuyết phủ trắng xoá, gió bấc vi vu và mấy người khách qua đường quần áo ấm áp vội vã đi đến những nơi hẹn hò, hoàn toàn lãnh đạm với cảnh nghèo khổ của em bé bán diêm.",
          "Em quẹt que diêm thứ ba. Bỗng em thấy hiện ra một cây thông Nô-en. Cây này lớn và trang trí lộng lẫy hơn cây mà em đã được thấy năm ngoái qua cửa kính một nhà buôn giàu có. Hàng ngàn ngọn nến sáng rực, lấp lánh trên cành lá xanh tươi và rất nhiều bức tranh màu sắc rực rỡ như những bức bày trong các tủ hàng, hiện ra trước mắt em bé.",
          "Em với đôi tay về phía cây... nhưng diêm tắt. Tất cả các ngọn nến bay lên, bay lên mãi rồi biến thành những ngôi sao trên trời.",
          "Chắc hẳn có ai vừa chết. – Em bé tự nhủ, vì bà em, người hiền hậu độc nhất đối với em, đã chết từ lâu, trước đây thường nói rằng: “Khi có một ngôi sao đổi ngôi là có một linh hồn bay lên trời với Thượng đế”.",
          "Em quẹt một que diêm nữa vào tường, một ánh sáng xanh toả ra xung quanh và em bé nhìn thấy rõ ràng bà em đang mỉm cười với em.",
          "– Bà ơi! – Em bé reo lên. – Cho cháu đi với! Cháu biết rằng diêm tắt thì bà cũng biến đi mất như lò sưởi, ngỗng quay và cây Nô-en ban nãy, nhưng xin bà đừng bỏ cháu ở nơi này; trước kia, khi bà chưa về với Thượng đế chí nhân, bà cháu ta đã từng sung sướng biết bao! Dạo ấy bà đã nhủ cháu rằng nếu cháu ngoan ngoãn, cháu sẽ được gặp lại bà, bà ơi! Cháu van bà, bà xin với Thượng đế chí nhân cho cháu về với bà. Chắc Người không từ chối đâu.",
          "Que diêm tắt phụt, và ảo ảnh rực sáng trên khuôn mặt em bé cũng biến mất.",
          "Thế là em quẹt tất cả những que diêm còn lại trong bao. Em muốn níu bà lại! Diêm nối nhau chiếu sáng như giữa ban ngày. Chưa bao giờ em thấy bà em to lớn và đẹp lão như thế này. Bà cụ cầm lấy tay em, rồi hai bà cháu bay vụt lên cao, cao mãi, chẳng còn đói rét, đau buồn nào đe doạ họ nữa. Họ đã về chầu Thượng đế.",
          "Sáng hôm sau tuyết vẫn phủ kín mặt đất, nhưng mặt trời lên trong sáng, chói chang trên bầu trời nhạt. Mọi người vui vẻ ra khỏi nhà.",
          "Trong buổi sáng lạnh lẽo ấy, ở một xó tường người ta thấy một em gái có đôi má hồng và đôi môi đang mỉm cười. Em đã chết vì rét trong đêm giao thừa.",
          "Ngày mồng một đầu năm hiện lên tử thi em bé ngồi giữa những bao diêm, trong đó có một bao đã hết nhẵn. Mọi người bảo nhau: “Chắc nó muốn sưởi ấm!”. Nhưng chẳng ai biết những cái kì diệu em đã trông thấy, nhất là cảnh huy hoàng lúc hai bà cháu bay lên để đón lấy những niềm vui đầu năm."
        ],
        questions: [
          "Cô bé bán diêm phải ở ngoài đường phố trong một đêm như thế nào? Vì sao cô bé không dám về nhà?",
          "Những hình ảnh xuất hiện sau mỗi lần quẹt diêm thể hiện ước mong nào của cô bé?",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Bài 4: Quê hương yêu dấu",
    theme: "Ca dao, thơ lục bát",
    quote: {
      text: "Đường vô xứ Nghệ quanh quanh / Non xanh nước biếc như tranh hoạ đồ.",
      author: "Ca dao",
    },
    objectives: [
      "Nhận biết thể thơ lục bát: số tiếng mỗi dòng, cách gieo vần, ngắt nhịp.",
      "Hiểu nội dung và tình cảm gửi gắm trong ca dao về quê hương, đất nước.",
      "Nhận biết và nêu tác dụng của biện pháp tu từ hoán dụ.",
      "Tập làm một bài thơ lục bát ngắn về quê hương.",
    ],
    texts: [
      {
        name: "Chùm ca dao về quê hương đất nước",
        fullText: [
          "Gió đưa cành trúc la đà\nTiếng chuông Trấn Võ canh gà Thọ Xương.\nMịt mù khói toả ngàn sương\nNhịp chày Yên Thái, mặt gương Tây Hồ.",
          "Đường lên xứ Lạng bao xa?\nCách một trái núi với ba quãng đồng.\nAi ơi, đứng lại mà trông:\nKìa núi thành Lạng, kia sông Tam Cờ.",
          "Đò từ Đông Ba, đò qua Đập Đá,\nĐò về Vĩ Dạ, thẳng ngã ba Sình.\nLờ đờ bóng ngả trăng chênh\nTiếng hò xa vọng, nặng tình nước non."
        ],
        questions: [
          "Mỗi bài ca dao có mấy dòng? Cách phân bố số tiếng trong các dòng cho thấy đặc điểm gì của thơ lục bát?",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Bài 5: Những nẻo đường xứ sở",
    theme: "Kí, du kí",
    quote: {
      text: "Mặt trời nhú lên dần dần, rồi lên cho kì hết. Tròn trĩnh phúc hậu như lòng đỏ một quả trứng thiên nhiên đầy đặn.",
      author: "Cô Tô (Nguyễn Tuân)",
    },
    objectives: [
      "Nhận biết đặc điểm của kí, du kí: người viết kể lại điều mắt thấy tai nghe.",
      "Chỉ ra những chi tiết miêu tả cảnh vật và cảm xúc của người viết.",
      "Cảm nhận vẻ đẹp phong phú của thiên nhiên, con người Việt Nam.",
      "Viết bài văn kể lại một trải nghiệm đáng nhớ của bản thân.",
    ],
    texts: [
      {
        name: "Cô Tô (Nguyễn Tuân) - bản tóm tắt",
        fullText: [
          "Tác giả miêu tả cảnh gió bão dữ dội trên bãi biển, gió thổi mạnh mang theo cát đập vào người buốt như đạn mũi kim. Sóng biển và cát mù mịt tạo nên một cảnh tượng dữ dội, ầm ầm như đang rung lên những hồi trống trận.",
          "Bão thực sự bắt đầu vào lúc cuối canh một. Cảnh tượng trở nên vô cùng kinh hoàng, gió rít lên từng hồi ghê rợn như quỷ khóc thần kinh, làm vỡ tung cả những cửa kính trên trạm gác.",
          "Ngày thứ năm trên đảo Cô Tô là một ngày trời trong trẻo và sáng sủa sau bão. Nước biển lam biếc, cây cối xanh tươi, người dân chài ra khơi đánh bắt được mẻ lưới nặng đầy cá. Tác giả trèo lên đồn để ngắm nhìn toàn cảnh hòn đảo bao la và cảm thấy vô cùng yêu mến mảnh đất này.",
          "Khung cảnh mặt trời mọc rực rỡ và tráng lệ vào ngày thứ sáu trên đảo Thanh Luân. Mặt trời dần nhú lên từ chân trời sạch như tấm kính lau hết bụi mây, trông tròn trĩnh và hồng hào như một quả trứng thiên nhiên khổng lồ đặt trên mâm bạc.",
          "Khi mặt trời đã lên cao, cuộc sống trở lại nhịp điệu bình dị thường ngày. Tác giả hoà mình vào nhịp sinh hoạt bằng việc tắm mát bên cái giếng nước ngọt trên đảo, nơi mang lại cảm giác vui vẻ, tấp nập và đậm đà hơn bất cứ khu chợ nào trong đất liền.",
          "Cảnh lao động nhộn nhịp quanh giếng nước ngọt của đảo khi có rất đông người hối hả gánh nước trữ vào thuyền. Trong đó, anh hùng Châu Hoà Mãn cùng các bạn xã viên đang lấy nước ngọt vào sạp thuyền cho một chuyến ra khơi đánh cá hồng có thể kéo dài hàng chục ngày.",
          "Không khí khẩn trương của đoàn thuyền nối tiếp nhau chuẩn bị nhổ neo. Hình ảnh chị Châu Hoà Mãn dịu dàng địu con vất vả đi lại trên bến đã gợi lên sự yên tâm, che chở như biển cả bao la là người mẹ hiền mang nguồn sống nuôi dưỡng những đứa con lành."
        ],
        questions: ["Biển sau bão hiện lên như thế nào qua hình ảnh bầu trời, cây, nước biển, mặt trời?"],
      },
    ],
  },
  {
    id: 6,
    title: "Bài 6: Chuyện kể về những người anh hùng",
    theme: "Truyền thuyết",
    quote: {
      text: "Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước.",
      author: "Chủ tịch Hồ Chí Minh",
    },
    objectives: [
      "Nhận biết đặc điểm của truyền thuyết: cốt truyện, nhân vật, yếu tố kì ảo.",
      "Chỉ ra mối liên hệ giữa truyện với sự kiện, dấu tích lịch sử.",
      "Hiểu ý nghĩa hình tượng người anh hùng trong lòng nhân dân.",
      "Tự hào và biết ơn những người có công với đất nước.",
    ],
    texts: [
      {
        name: "Thánh Gióng",
        fullText: [
          "Tục truyền, đời Hùng Vương thứ sáu, ở làng Phù Đổng, có hai vợ chồng ông lão nhà nghèo, chăm làm ăn và có tiếng là phúc đức. Hai ông bà ao ước có một chút con để tuổi già đỡ hiu quạnh.",
          "Một hôm, bà ra đồng, trông thấy một vết chân to hơn vết chân người thường. Thấy hay hay, bà đặt bàn chân mình vào, ướm thử. Không ngờ về nhà bà thụ thai, rồi sau mười hai tháng thai nghén, bà sinh ra một em bé, mặt mũi rất khôi ngô. Hai vợ chồng lấy làm mừng lắm. Nhưng kì lạ thay, chú bé đã ba tuổi mà chẳng biết cười, biết nói gì cả, và cũng không nhích đi được bước nào, đặt đâu nằm đấy [...].",
          "Bấy giờ, có giặc Ân đến xâm phạm bờ cõi nước ta. Thế giặc rất mạnh, nhà vua lo sợ, bèn truyền sứ giả đi khắp nơi, tìm người tài giỏi cứu nước.",
          "Chú bé nghe tin, bỗng dưng cất tiếng nói với mẹ:\n- Mẹ ra mời sứ giả vào đây, con xin thưa chuyện.",
          "Sứ giả vào. Chú bé bảo:\n- Ông về tâu với vua, đúc cho ta một con ngựa bằng sắt, làm cho ta một bộ áo giáp bằng sắt, và rèn cho ta một cái roi cũng bằng sắt, ta nguyện phá tan lũ giặc này.",
          "Sứ giả vừa ngạc nhiên vừa mừng rỡ, vội vàng về tâu với vua. Vua lập tức sai thợ đêm ngày phải làm cho đủ những đồ vật như lời chú bé dặn.",
          "Càng lạ hơn nữa, sau hôm gặp sứ giả, chú bé lớn nhanh như thổi. Cơm ăn mấy cũng không no. Áo vừa may xong đã chật ních. Hai vợ chồng làm ra bao nhiêu cũng không đủ nuôi con, thành thử phải chạy nhờ bà con hàng xóm. Bà con hàng xóm cũng vui lòng gom góp gạo thóc để nuôi chú bé, vì ai cũng mong chú bé giết giặc, cứu nước.",
          "Giặc đã đến chân núi Trâu Sơn. Thế rất nguy, ai nấy đều hoảng hốt. Vừa lúc đó thì sứ giả đem ngựa sắt, áo giáp sắt, roi sắt đến. Chú bé vùng dậy, vươn vai một cái, bỗng biến thành một tráng sĩ, oai phong lẫm liệt. Tráng sĩ bước lại, vỗ vào mông ngựa. Ngựa hí vang lên mấy tiếng. Tráng sĩ mặc áo giáp vào, cầm roi, nhảy lên mình ngựa. Ngựa phun lửa, phi thẳng đến chỗ quân giặc đóng. Tráng sĩ xông vào trận đánh giết; giặc chết như ngả rạ. Bỗng roi sắt gãy. Tráng sĩ bèn nhổ những cụm tre cạnh đường quật vào giặc. Giặc tan vỡ.",
          "Đám tàn quân giẫm đạp nhau mà trốn thoát. Tráng sĩ đuổi đến núi Ninh Sóc. Nhưng đến đấy, không biết vì sao, Người một mình cưỡi ngựa lên đỉnh núi, cởi giáp sắt bỏ lại, rồi cả người lẫn ngựa từ từ bay lên trời, biến mất.",
          "Vua nhớ công ơn, không biết lấy gì đền đáp, bèn phong là Phù Đổng Thiên Vương, và lập miếu thờ ngay ở quê nhà.",
          "Hiện nay, vẫn còn đền thờ ở làng Phù Đổng, tục gọi là làng Gióng. Mỗi năm đến tháng Tư, làng mở hội to lắm. Người ta kể rằng những bụi tre đằng ngà ở huyện Gia Bình vì ngựa phun lửa bị cháy, nên mới ngả màu vàng óng như thế. Còn những vết chân ngựa nay thành những hồ ao liên tiếp. Và khi ngựa thét ra lửa có cháy mất cả một làng. Làng đó nay gọi làng Cháy."
        ],
        questions: [
          "Thánh Gióng đã ra đời một cách kì lạ như thế nào?",
          "Chiến công phi thường mà Thánh Gióng đã làm nên là gì?",
        ],
      },
    ],
  },
  {
    id: 7,
    title: "Bài 7: Thế giới cổ tích",
    theme: "Truyện cổ tích",
    quote: {
      text: "Ở hiền thì lại gặp lành / Những người nhân đức trời dành phúc cho.",
      author: "Ca dao",
    },
    objectives: [
      "Nhận biết đặc điểm của truyện cổ tích: nhân vật, cốt truyện, yếu tố thần kì.",
      "Chỉ ra sự đối lập giữa nhân vật thiện và nhân vật ác.",
      "Hiểu ước mơ công lí, công bằng của nhân dân qua kết thúc có hậu.",
      "Kể lại một truyện cổ tích bằng lời văn của em.",
    ],
    texts: [
      {
        name: "Thạch Sanh",
        fullText: [
          "Ngày xưa, có một chàng trai nghèo tên là Thạch Sanh. Thạch Sanh sống lủi thủi một mình trong túp lều cũ dựng dưới gốc đa. Cả gia tài chỉ có một lưỡi búa, hằng ngày lên rừng đốn củi kiếm ăn.",
          "Một hôm có người hàng rượu tên là Lý Thông đi qua đó, nghỉ ở gốc đa. Thấy Thạch Sanh gánh về một gánh củi lớn, hắn nghĩ bụng: “Người này khoẻ như voi. Nếu nó về ở cùng ta thì lợi bao nhiêu”. Lý Thông lân la gợi chuyện rồi gạ cùng Thạch Sanh kết nghĩa anh em. Vì sớm mồ côi cha mẹ, tứ cố vô thân, nay lại có người săn sóc đến mình, Thạch Sanh cảm động, vui vẻ nhận lời và chàng từ giã gốc cây đa đến sống chung với mẹ con Lý Thông.",
          "Bấy giờ trong vùng có con trăn tinh có nhiều phép lạ, thường ăn thịt người. Quan quân đã nhiều lần đến bố vây định diệt trừ nhưng không thể làm gì được. Dân trong vùng phải lập cho nó một cái miếu thờ, hằng năm nộp một mạng người cho nó ăn thịt để nó đỡ phá phách.",
          "Năm ấy đến lượt Lý Thông nộp mình. Mẹ con hắn nghĩ kế lừa cho Thạch Sanh đi chết thay. Chiều hôm đó, Thạch Sanh đi kiếm củi về, Lý Thông dọn một mâm rượu thịt ê hề mời ăn, rồi bảo:",
          "- Đêm nay anh đến phiên đi canh miếu thờ, ngặt vì dở cất mẻ rượu, em chịu khó đi thay anh một đêm, đến sáng lại về.",
          "Thạch Sanh thật thà nhận lời đi ngay.",
          "Nửa đêm hôm ấy, Thạch Sanh đang mơ màng nửa thức nửa ngủ, bỗng nghe thấy có tiếng động mạnh sau miếu. Chàng vừa xách búa đứng dậy thì trăn tinh đã hiện ra, nhe nanh vuốt xông vào con mồi. Thạch Sanh không hề sợ hãi, giơ cao búa giáng thật mạnh vào đầu trăn tinh. Thạch Sanh đã xả xác nó ra làm hai mảnh. Trăn tinh hiện nguyên hình là một con trăn khổng lồ và để lại bên mình một bộ cung tên bằng vàng. Thạch Sanh ung dung chặt đầu con quái vật và nhặt bộ cung tên vàng xách về nhà. Lúc ấy đã gần về sáng. Mẹ con Lý Thông còn đang ngủ bỗng nghe tiếng gọi cửa. Ngờ là oan hồn Thạch Sanh hiện về báo oán, chúng hoảng sợ van lạy rối rít. Khi Thạch Sanh vào nhà kể chuyện giết trăn tinh, mẹ con Lý Thông mới hoàn hồn. Nhưng những kẻ độc ác thì trong đầu bao giờ cũng có sẵn những mưu thâm. Lý Thông nói với Thạch Sanh:",
          "- Con trăn ấy vốn là của nhà vua nuôi từ lâu. Nay em giết nó chắc không tránh khỏi tội nặng. Thôi bây giờ nhân trời chưa sáng, em hãy trốn ngay đi. Có chuyện gì để anh ở nhà lo liệu!",
          "Thạch Sanh thật thà tin ngay, vội từ giã mẹ con Lý Thông ra đi. Chàng lại trở về với túp lều cũ dưới gốc đa, kiếm củi nuôi thân. Còn Lý Thông hí hửng đem đầu của con yêu quái vào kinh đô nộp cho nhà vua. Vua khen ngợi và phong cho làm Quận công.",
          "Nhà vua có một cô công chúa vừa đến tuổi lấy chồng. Một hôm công chúa đang ngồi trên lầu cao bỗng bị một con đại bàng khổng lồ bay đến quắp đi. Con đại bàng bay qua phía trên túp lều của Thạch Sanh, Thạch Sanh trông thấy liền dùng cung tên vàng bắn theo một phát. Mũi tên trúng vào cánh đại bàng. Nó đau đớn, quằn quại nhưng gắng sức bay về đến hang trong núi sâu. Thạch Sanh lần theo vết máu, tìm được chỗ ở của đại bàng.",
          "Nhà vua vô cùng đau đớn, bèn sai Lý Thông đi tìm, hứa sẽ gả công chúa và nhường ngôi cho. Vừa mừng, vừa lo, Lý Thông lại tìm đến túp lều dưới gốc đa của Thạch Sanh. Thạch Sanh thật thà kể cho hắn nghe chàng đã bắn đại bàng bị thương và lần ra được hang ổ của nó như thế nào. Lý Thông mừng quá liền nhờ Thạch Sanh dẫn đường cho quân sĩ đến hang đá. Hang sâu thăm thẳm, nhìn vào ai cũng thấy rùng mình, hoảng sợ.",
          "Thạch Sanh xin cho mình được xuống hang cứu công chúa. Quân sĩ lấy dây dài buộc vào lưng chàng rồi dòng xuống. Đại bàng nguyên là một con yêu tinh ở trên núi có nhiều phép lạ. Tuy bị thương nặng nhưng khi thấy Thạch Sanh xuất hiện nó cũng đã vùng ngay dậy được, vung cánh chĩa vuốt, lao vào kẻ thù mạnh như một cơn bão lớn. Thạch Sanh dùng cung tên vàng bắn mù hai mắt đại bàng, rồi vung búa chặt đứt vuốt sắc, bổ vỡ đôi đầu đại bàng. Sau khi giết được chim dữ, Thạch Sanh lấy dây buộc vào người công chúa rồi ra hiệu cho quân Lý Thông kéo lên trước. Sau khi đưa được công chúa lên tới mặt đất, Lý Thông liền ra lệnh cho quân sĩ vần những tảng đá lớn lấp kín cửa hang lại, rồi kéo nhau về. Thạch Sanh đi sâu vào hang, để tìm lối ra khác. Đến cuối hang, chàng thấy có một chiếc cũi sắt. Một chàng trai khôi ngô tuấn tú bị nhốt trong đó, chàng trai đó chính là Thái tử con vua Thuỷ Tề. Thạch Sanh bèn dùng cung vàng bắn tan cũi sắt cứu Thái tử ra. Thái tử thoát nạn hết lời cảm tạ chàng và mời chàng xuống chơi Thuỷ phủ.",
          "Vua Thuỷ Tề sung sướng được gặp lại con, đãi chàng rất hậu. Khi chàng về, vua biếu rất nhiều vàng bạc nhưng Thạch Sanh không nhận, chỉ xin có một cây đàn. Rồi chàng lại trở về gốc đa sinh nhai bằng nghề cũ.",
          "Hồn trăn tinh và đại bàng lang thang, một hôm gặp nhau bàn cách báo thù Thạch Sanh. Chúng vào kho của nhà vua ăn trộm của cải mang tới quẳng ở gốc đa để vu vạ cho Thạch Sanh. Thạch Sanh bị bắt hạ ngục.",
          "Về phần nàng công chúa bất hạnh, từ khi được cứu thoát đưa về cung thì bị câm. Suốt ngày nàng chẳng nói, chẳng cười, mặt buồn rười rượi. Vua đành hoãn việc cưới xin và bảo Lý Thông mời thầy thuốc về chạy chữa. Không biết bao nhiêu thầy thuốc giỏi trong nước đã được mời đến nhưng không ai chữa được bệnh câm và tâm trạng sầu não của công chúa.",
          "Một hôm, Thạch Sanh ngồi trong ngục tối, đem đàn của vua Thuỷ Tề cho ra gảy. Tiếng đàn vang lên như những lời trách oán, trách sự hờ hững của công chúa và oán sự độc ác của Lý Thông. Tiếng đàn vẳng đến hoàng cung, lọt vào tai công chúa. Vừa nghe tiếng đàn, công chúa bỗng cười nói vui vẻ. Nàng xin vua cha cho gọi người đánh đàn vào cung.",
          "Nhà vua lấy làm lạ, cho đòi Thạch Sanh đến. Trước mặt mọi người, chàng kể hết đầu đuôi chuyện của mình, từ chuyện kết bạn với Lý Thông đến chuyện chém trăn tinh, từ chuyện giết đại bàng, cứu công chúa đến chuyện bị lấp cửa hang và cuối cùng là chuyện bị bắt oan vào ngục thất của hoàng cung. Mọi người bấy giờ mới hiểu ra tất cả sự thật. Vua sai bắt giam hai mẹ con Lý Thông lại giao cho Thạch Sanh xét xử. Chàng rộng lượng tha thứ cho chúng về quê làm ăn. Nhưng về đến nửa đường thì chúng bị sét đánh chết.",
          "Nhà vua gả công chúa cho Thạch Sanh, lễ cưới của họ tưng bừng nhất kinh kì, chưa bao giờ và chưa ở đâu có lễ cưới tưng bừng như thế. Thấy vậy, bọn hoàng tử các nước chư hầu trước kia bị công chúa từ hôn lấy làm tức giận. Họ hội họp binh lính cả mười tám nước lại kéo sang đánh. Thạch Sanh xin nhà vua đừng động binh. Chàng một mình cầm cây đàn ra trước quân giặc. Tiếng đàn của chàng vừa cất lên thì quân sĩ của mười tám nước bủn rủn tay chân, không còn nghĩ gì được tới chuyện đánh nhau nữa. Cuối cùng, các hoàng tử phải cuốn giáp ra về. Thạch Sanh sai dọn một bữa cơm thết đãi những kẻ thua trận. Cả mấy vạn tướng lĩnh, quân sĩ thấy Thạch Sanh chỉ cho dọn ra vẻn vẹn có một niêu cơm tí xíu thì ai nấy đều ngạc nhiên, toan bỏ về. Thạch Sanh thân chinh đến mời họ cầm đũa và hứa sẽ trọng thưởng cho những ai ăn hết nồi cơm đó. Quân sĩ mười tám nước ăn mãi, ăn mãi nhưng nồi cơm bé xíu vậy mà cứ ăn hết lại đầy. Sau khi ăn no nê, quân sĩ mười tám nước cúi đầu lạy tạ vợ chồng Thạch Sanh và kéo nhau về nước.",
          "Về sau, vua không có con trai nên đã nhường ngôi cho Thạch Sanh."
        ],
        questions: [
          "Trong truyện, hai nhân vật Thạch Sanh và Lý Thông luôn đối lập nhau về hành động. Hãy chỉ ra sự đối lập đó.",
          "Kết thúc truyện, Thạch Sanh được nhà vua gả công chúa và nhường ngôi. Tác giả dân gian muốn thể hiện điều gì?",
        ],
      },
    ],
  },
  {
    id: 8,
    title: "Bài 8: Khác biệt và gần gũi",
    theme: "Văn nghị luận",
    quote: {
      text: "Mỗi người là một bông hoa riêng – cùng nhau, chúng ta làm nên cả khu vườn.",
      author: "Lời nhắn của Cô Cú",
    },
    objectives: [
      "Nhận biết ý kiến, lí lẽ và bằng chứng trong văn bản nghị luận.",
      "Chỉ ra mối liên hệ giữa các lí lẽ, bằng chứng với ý kiến của người viết.",
      "Biết tôn trọng sự khác biệt và tìm điểm gần gũi giữa mọi người.",
      "Trình bày ý kiến của em về một hiện tượng trong đời sống.",
    ],
    texts: [
      {
        name: "Hai loại khác biệt (Giong-mi Mun)",
        fullText: [
          "Khi tôi còn học trung học, một thầy giáo của chúng tôi đã giao cho cả lớp một bài tập phải hoàn thành trong 24 tiếng đồng hồ. Bài tập là trong suốt 24 tiếng đồng hồ chúng tôi phải cố gắng trở nên khác biệt. Theo lời thầy, mục đích của bài tập là tạo cơ hội để chúng tôi bộc lộ một phiên bản chân thật hơn về bản thân trước những người xung quanh. Quy định duy nhất là chúng tôi không được làm bất cứ điều gì gây hại, làm phiền người khác, hoặc vi phạm nội quy nhà trường.",
          "Vào buổi sáng thực hiện bài tập, tôi quyết định tỏ ra khác biệt bằng cách mặc một bộ trang phục kì dị đến trường, với đồ pi-gia-ma kết hợp với áo thun dài tay. Trông tôi như thể vừa lăn ra khỏi giường ngủ. Khi đến trường, tôi phát hiện ra rằng rất nhiều bạn cùng lớp cũng chọn cách tương tự – họ sử dụng quần áo để biểu lộ cá tính; hành lang trường đầy những học sinh mặc quần áo quái lạ. Một số bạn để kiểu tóc kì quặc, trong khi một số khác lại làm trò quái đản với trang sức hoặc phấn trang điểm. Một số lại quyết định tham gia vào những hoạt động ngu ngốc, gây chú ý. Tôi còn nhớ có một nhóm con gái nắm tay nhau, vừa đi dọc theo hành lang qua các lớp học, vừa cười, vừa hát như một nhóm trẻ mẫu giáo. Tôi còn nhớ có một bạn nữ, một vận động viên, đã nhào lộn trong phòng ăn trưa.",
          "[...] Duy nhất, có một bạn – hãy tạm gọi bạn ấy là J – tạo ấn tượng trong tôi. Nhân tiện, bạn không thể hình dung một người như cậu ấy có thể làm được điều đó. J là người ít nói, không đặc biệt quái dị cũng như không đặc biệt nổi tiếng. Chắc chắn cậu càng không phải là loại thích chơi trội. Thế rồi, sáng hôm đó, J đến trường, ăn mặc như bình thường và trông hệt như mọi ngày. Nhưng khi cậu giơ tay trong tiết đầu tiên – tôi không còn nhớ tiết học về môn gì, có lẽ là Lịch sử hay Vật lí gì đó – cậu đã làm một điều bất ngờ khi thấy gọi cậu phát biểu: Cậu đã đứng lên trả lời câu hỏi.",
          "Đúng vậy, cậu đã đứng lên. Để trả lời câu hỏi. Và khi phát biểu, cậu nói một cách thật từ tốn, dõng dạc và lễ độ. Như thể không có gì quan trọng hơn, không có gì ý nghĩa hơn tiết học này, câu trả lời này đây. Tôi còn nhớ khi đó tôi và những bạn khác trong lớp nhìn nhau như tự hỏi, Cậu ấy nghiêm túc thật đấy ư?",
          "Rồi tiết học tiếp theo cũng như vậy. Bất cứ khi nào J được gọi, cậu đều đứng lên trả lời câu hỏi. Và mỗi lần phát biểu, cậu đều nói với giọng hoàn toàn chân thành. Như thể cậu rất quan tâm đến câu hỏi, như thể cậu thật sự muốn câu trả lời của mình có một giá trị nhất định. Không những thế – cậu còn nói với thầy giáo là Thưa thầy. Cậu gọi tất cả chúng tôi bằng anh chị. Và đến cuối tiết học, cậu tiến lên phía trước và bắt tay thầy giáo như một lời cảm ơn thầm lặng.",
          "Lần đầu tiên khi J làm như thế, cả bọn chúng tôi cứ cười khúc khích, và thành thật mà nói, ai cũng sẽ cười thôi. Hành động của cậu thật kì quặc và dường như tất cả chúng tôi đều trông đợi một trò đùa nào đó. Nhưng khi ngày dần trôi qua, tiếng cười khúc khích vơi đi, vì – tôi cũng chẳng biết nữa – chúng tôi bắt đầu nhận ra điều J đang làm mới tuyệt làm sao. Một điều gì đó trang trọng, một điều gì đó chững chạc, thậm chí có phần dũng cảm. Và cậu làm rất tốt – lại thêm một điểm nữa. Cậu hiểu rõ mình đang làm gì, cậu hành xử rất mực nghiêm trang. Tôi không thể đại diện cho cả lớp, nhưng đến cuối ngày, chúng tôi đều nhất trí rằng những điều J đã làm khá là mẫu mực.",
          "Điều tôi học được từ bài tập này là: sự khác biệt chia làm hai loại. Một loại khác biệt vô nghĩa, và một loại khác biệt có ý nghĩa. Khi tôi quyết định mặc bộ đồ quái dị đến trường, tôi biết rằng mình không phải là người duy nhất, nhưng tôi đã chọn trò đơn giản nhất vì không quan tâm tìm kiếm một thứ ý nghĩa hơn. Và thành thật mà nói, tôi đoán rằng mình thật sự chẳng hề cố tỏ ra khác biệt, hoặc nếu có, tôi chỉ chọn loại khác biệt vô nghĩa. Về vấn đề này, tôi cũng chẳng đơn độc; đa số chúng tôi đều chọn loại vô nghĩa.",
          "Chỉ có J là ngoại lệ. Trong 24 tiếng đồng hồ đó, cái nhìn của tôi về J đã hoàn toàn thay đổi; tất cả chúng tôi đều nhận thấy điều đó. Tôi không rõ tại sao cậu lại làm thế; có lẽ cậu thực sự có điều gì đó muốn nhắn nhủ với chúng tôi. Bất kể vì lí do gì, J là người duy nhất chọn loại khác biệt có ý nghĩa. Kết quả là vào cuối ngày hôm đó, tôi cảm giác rằng không một ai trong chúng tôi lại không nể phục cậu.",
          "Khi nói đến việc thu hút sự chú ý, sẽ có những người chọn cách dễ dàng, không tốn chút tâm sức. Họ cố thu hút chúng ta bằng cách gây náo động hoặc tỏ ra ngu ngốc, hoặc bằng cách mặc đồ pi-gia-ma nhàu nhĩ đến trường. Nhưng khi điều này xảy ra, hoá ra nếu chúng ta có đủ thời gian để suy nghĩ, thì đây chính là điều chúng ta sẽ làm: Chúng ta chỉ đơn thuần tách những người vô nghĩa ra khỏi những người có ý nghĩa, và chúng ta bỏ qua nhóm đầu tiên vì họ chẳng có gì khác biệt. Với nhóm thứ hai, họ là những người khiến chúng ta đặc biệt chú ý, những người chúng ta cho là khác biệt thật sự."
        ],
        questions: [
          "Việc thể hiện sự khác biệt của số đông các bạn trong lớp và của J hoàn toàn khác nhau. Sự khác nhau ấy biểu hiện cụ thể như thế nào?",
        ],
      },
    ],
  },
  {
    id: 9,
    title: "Bài 9: Trái Đất - ngôi nhà chung",
    theme: "Văn bản thông tin",
    quote: {
      text: "Trái Đất này là của chúng mình / Quả bóng xanh bay giữa trời xanh.",
      author: "Định Hải – Trái Đất này là của chúng em",
    },
    objectives: [
      "Nhận biết đặc điểm của văn bản thông tin: nhan đề, sa-pô, đề mục, hình ảnh.",
      "Chỉ ra cách triển khai thông tin và tác dụng của các phương tiện phi ngôn ngữ.",
      "Hiểu mối quan hệ giữa con người với thiên nhiên, muôn loài.",
      "Có ý thức hành động để bảo vệ Trái Đất – ngôi nhà chung.",
    ],
    texts: [
      {
        name: "Các loài chung sống với nhau như thế nào? (Ngọc Phú)",
        fullText: [
          "Trong bộ phim hoạt hình Vua sư tử sản xuất năm 1994 của hãng Oan Đi-xnây (Walt Disney), khi giới thiệu với đứa con Xim-ba (Simba) bé bỏng của mình về vương quốc hoang dã mà nó sắp tiếp quản, vua sư tử Mu-pha-sa (Mufasa) đã nói: “Tất cả những gì con thấy, cùng nhau tồn tại trong một sự cân bằng rất mong manh. Là vua, con cần phải hiểu rõ về sự cân bằng ấy và tôn trọng muôn loài, từ đàn kiến lúc nhúc cho đến bầy linh dương nhảy nhót”. Khi Xim-ba thắc mắc: “Nhưng cha ơi, chẳng phải chúng ta ăn thịt linh dương hay sao?”, Mu-pha-sa trả lời: “Đúng vậy, nhưng để cha giải thích đã. Khi chết đi, thân xác chúng ta trở về với cỏ, và linh dương lại ăn cỏ. Vì thế, tất cả chúng ta đều thuộc về vòng đời bất tận”. Cuộc đối thoại trên đã gợi lên trong chúng ta biết bao suy nghĩ về đời sống muôn loài trên Trái Đất và sự cân bằng rất dễ bị tổn thương của nó.",
          "Theo ước tính của nhiều nhà khoa học, trên Trái Đất hiện có khoảng trên 10 000 000 loài sinh vật. Hiện nay, con người mới chỉ nhận biết được khoảng trên 1 400 000 loài, trong đó có hơn 300 000 loài thực vật và hơn 1 000 000 loài động vật. Rõ ràng, phải rất lâu nữa chúng ta mới lập được một danh sách sát thực tế hơn về những cư dân của hành tinh này. Dù vậy, điều đó không ngăn cản các nhà khoa học đưa ra những nhận định khái quát nhất về lịch sử tiến hoá hay sự phụ thuộc lẫn nhau của muôn loài.",
          "Các loài động vật và thực vật thường tồn tại và phát triển thành từng quần xã, trong những biome khác nhau. Mỗi quần xã có thể được xem như một thế giới riêng, trong đó có sự chung sống của một số loài nhất định với số lượng cá thể hết sức khác nhau ở riêng từng loài.",
          "Tính đa dạng ở mỗi quần xã phụ thuộc vào sự cạnh tranh giữa các loài, mối quan hệ con mồi – vật ăn thịt và mức độ thay đổi của các yếu tố vật lí – hoá học của môi trường....",
          "Bên cạnh việc nhận diện các loài theo đặc điểm sinh học riêng của chúng, khi dựa vào tính chất của loài trong quần xã, người ta có thể nói tới: loài ưu thế, loài thứ yếu, loài ngẫu nhiên, loài chủ chốt, loài đặc trưng... Loài ưu thế (như cây thông trong quần xã rừng thông) đóng vai trò quan trọng trong quần xã do số lượng nhiều và có khả năng hoạt động mạnh. Loài chủ chốt (như sư tử ở các đồng cỏ hay cá sấu ở đầm nước châu Phi) đóng vai trò kiểm soát, khống chế hoạt động của các loài khác và duy trì sự phát triển ổn định của quần xã. Như vậy, trong quần xã luôn tồn tại một trật tự. Ngoài những điều kể trên, trật tự này còn được thể hiện ở sự phân bố các loài trong không gian sống chung, hoặc theo chiều thẳng đứng (như sự phân tầng của thực vật trong rừng mưa nhiệt đới), hoặc theo chiều ngang (trải ra theo bề rộng của địa hình), để giảm bớt sự cạnh tranh giữa các loài và giúp từng loài có thể sử dụng nguồn sống của môi trường một cách hiệu quả nhất.",
          "Giữa các loài trong quần xã luôn tồn tại mối quan hệ hỗ trợ và đối kháng. Quan hệ hỗ trợ gắn liền với việc chia sẻ cơ hội sống. Quan hệ đối kháng được biểu hiện qua việc cạnh tranh, kí sinh, ăn thịt lẫn nhau. Với sự tồn tại song song của các quan hệ đó, thiên nhiên đã tạo nên một sự cân bằng tuyệt hảo, đảm bảo cho loài nào cũng có được “chỗ đứng dưới mặt trời”, cũng có đủ điều kiện để sinh trưởng. Như vậy, có một nhịp điệu chung trong quá trình tiến hoá của các loài, mà sự sinh sôi mạnh mẽ hay suy giảm số lượng của loài này dẫn đến sự phát triển theo hướng nhiều thêm hay bớt đi tương ứng của loài kia.",
          "Trên Trái Đất, con người cũng chỉ là một loài sinh vật. Qua quá trình lịch sử dài lâu, con người đã bộc lộ khả năng sáng tạo vô tận và xã hội loài người ngày càng phát triển phức tạp. Con người trở nên quá tự kiêu, thấy mình là chúa tể của cả thế giới, có thể tuỳ ý xếp đặt lại trật tự mà tạo hoá đã bền bỉ gây dựng. Chính vì điều này mà sự cân bằng trong đời sống của muôn loài ít nhiều bị xáo trộn, phá vỡ, thêm vào đó, những yếu tố vô sinh của môi trường cũng phải chịu những tác động xấu. Hiện nay, có vẻ như con người bắt đầu tỉnh ngộ, biết nhìn nhận vấn đề một cách sáng suốt hơn, biết tìm cách chung sống hài hoà với muôn loài, nói chung là với tất cả những gì làm nên thế giới đẹp đẽ này.",
          "“Tất cả chúng ta đều thuộc về vòng đời bất tận”. Vua sư tử Mu-pha-sa đã nói với Xim-ba – kẻ kế nghiệp – như thế. Một câu nói thông thái, cho thấy sự am hiểu bản chất cuộc sống và cách ứng xử khôn ngoan đối với đời sống của muôn loài."
        ],
        questions: [
          "Nếu chỉ tồn tại quan hệ đối kháng, sự cân bằng trong từng quần xã sinh vật sẽ bị ảnh hưởng ra sao?",
        ],
      },
    ],
  },
  {
    id: 10,
    title: "Bài 10: Cuốn sách tôi yêu",
    theme: "Dự án đọc sách",
    quote: {
      text: "Sách mở ra trước mắt tôi những chân trời mới.",
      author: "M. Go-rơ-ki",
    },
    objectives: [
      "Tự chọn và đọc trọn vẹn một cuốn sách phù hợp với lứa tuổi.",
      "Ghi chép, tóm tắt những điều thú vị và bài học rút ra từ cuốn sách.",
      "Viết đoạn văn trình bày ý kiến về một vấn đề gợi ra từ sách.",
      "Giới thiệu cuốn sách em yêu với các bạn một cách hấp dẫn.",
    ],
    texts: [
      {
        name: "Thực hành Đọc & Viết",
        fullText: [],
        questions: [
          "Hãy chọn một cuốn sách yêu thích và viết đoạn văn trình bày ý kiến về một hiện tượng đời sống được gợi ra từ cuốn sách đó.",
        ],
      },
    ],
  },
];

export const getLessonQuestion = (lessonId: number, textIndex: number, questionIndex: number) => {
  const lesson = lessonsData.find((l) => l.id === lessonId);
  const text = lesson?.texts[textIndex];
  const question = text?.questions[questionIndex];
  return lesson && text && question ? { lesson, text, question } : null;
};
