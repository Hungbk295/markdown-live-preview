# Synergizing Knowledge Graphs and Large Language Models for Social Relation Recognition in Videos - Phân tích phê bình toàn diện

## Thông tin bài báo
- **Title**: Synergizing Knowledge Graphs and Large Language Models for Social Relation Recognition in Videos
- **Paper ID**: 2025.emnlp-main.224
- **Published**: EMNLP 2025 (Main Conference)
- **Research Area**: Multimodal AI, Social Relation Recognition, Knowledge Graphs, Large Language Models
- **Code**: https://github.com/HarryWgCN/mtKG-LLM

## TL;DR
Bài báo này đề xuất mtKG-LLM, một khung kết hợp đồ thị tri thức (Knowledge Graphs) đa phương thức theo thời gian với Mô hình ngôn ngữ lớn (Large Language Models) để nhận dạng quan hệ xã hội (ví dụ: Couple, Friend, Leader-subordinate) trong video. Cách tiếp cận xây dựng KG không gian theo từng cảnh, duy trì KG theo thời gian xuyên suốt các cảnh, và dùng truy hồi đa tỉ lệ (mức cá nhân, tương tác, cộng đồng) để cho phép suy luận dựa trên LLM mà không cần fine-tuning. Tác giả tuyên bố hiệu năng state-of-the-art trên bốn bộ chuẩn với mức cải thiện 15%, dù phân tích này cho thấy có độ căng giữa các khẳng định lý thuyết và bằng chứng trích dẫn, cùng các lo ngại thực tiễn về chi phí tính toán.

## Câu hỏi nghiên cứu & giả thuyết

### Câu hỏi nghiên cứu chính
**RQ**: Làm thế nào để kết hợp hiệu quả đồ thị tri thức (KGs) và Mô hình ngôn ngữ lớn (LLMs) nhằm nhận dạng quan hệ xã hội trong video, đồng thời khắc phục hạn chế của cả xử lý tuần tự trong LLM và các phương pháp dựa trên đồ thị truyền thống?

**Các câu hỏi phụ**:
1. Làm thế nào để xây dựng KG theo thời gian đa phương thức từ dữ liệu video?
2. Làm thế nào để truy hồi thông tin đa tỉ lệ từ KG phục vụ suy luận của LLM?
3. Liệu tích hợp “low-coupling” có thể đạt hiệu năng SOTA mà không cần fine-tuning?

### Động cơ nghiên cứu
Bài báo chỉ ra một khoảng trống ba chiều:
- **LLMs**: Mạnh về hiểu đa phương thức nhưng gặp khó với các quan hệ có cấu trúc đồ thị (theo tuyên bố)
- **GNNs**: Xử lý đồ thị tốt nhưng bị giới hạn ở các tiểu đồ thị cục bộ và suy luận theo thời gian yếu
- **Embeddings**: Quá thô để phân biệt tinh vi các quan hệ xã hội

**Kết quả**: Chưa được kiểm chứng đầy đủ trong phần được cung cấp — kết quả thực nghiệm được để ở Section 5 (chưa phân tích)

### Đánh giá phê bình về RQ
- ✓ **Diễn đạt rõ ràng**: Vấn đề được trình bày mạch lạc
- ✓ **Tính liên quan thực tiễn**: Nhận dạng quan hệ xã hội có ứng dụng trong hiểu video, phân tích nội dung
- ⚠ **Giả định lý thuyết đáng nghi ngờ**: Khẳng định cốt lõi rằng “LLMs gặp thách thức đáng kể… do phụ thuộc vào dữ liệu huấn luyện tuần tự” bị mâu thuẫn bởi tài liệu được trích dẫn
  - Chakraborty (2024) — được trích trong bài — cho thấy “tiềm năng mạnh của LLMs trong suy luận nhiều bước (multi-hop) trên đồ thị tri thức”
  - Các nghiên cứu gần đây cho thấy LLMs có thể xử lý suy luận đồ thị với chiến lược prompting phù hợp
  - **Hệ quả**: Sự cần thiết của việc tích hợp KG có thể bị phóng đại; một cách giải thích khác là giới hạn mang tính phương pháp hơn là giới hạn căn bản

## Khung lý thuyết

### Nền tảng
**Lý thuyết cốt lõi**: Nhận dạng quan hệ xã hội cần ba thành phần:
1. **Mô hình hóa có cấu trúc đồ thị** — mạng xã hội vốn dĩ là đồ thị
2. **Động lực theo thời gian** — quan hệ thay đổi theo thời gian trong video
3. **Hiểu đa phương thức** — tích hợp nội dung thị giác + ngôn ngữ

**Khoảng trống được xác định**: Các phương pháp hiện có chỉ xử lý tối đa hai trong ba thành phần:
- Phương pháp embedding: Đa phương thức + một phần thời gian, nhưng mất cấu trúc đồ thị
- Phương pháp GNN: Có cấu trúc đồ thị, nhưng hạn chế về thời gian và bị ràng buộc vào các tiểu đồ thị
- Phương pháp chỉ dùng LLM: Hiểu đa phương thức, nhưng xử lý tuần tự không phù hợp cho đồ thị

### Giải pháp đề xuất: khung mtKG-LLM
Quy trình gồm bốn giai đoạn:
1. **Trích xuất KG đa phương thức** (KG không gian): Trích xuất V_C (characters), V_D (individual features), V_I (interactions), V_B (background) từ mỗi cảnh bằng MLLM (GPT-4o)
2. **Cập nhật KG theo thời gian**: Tích lũy đặc trưng qua các cảnh vào V_DT (temporal individuals) và V_IT (temporal interactions) thông qua tóm tắt bằng LLM
3. **Phát hiện cộng đồng**: Áp dụng thuật toán Leiden để phát hiện cộng đồng → tạo V_CM (community summaries)
4. **Nhận dạng quan hệ xã hội**: Suy luận bằng LLM dùng truy hồi đa tỉ lệ (V_DT, V_IT, V_CM) → dự đoán V_S (social relations)

### Đóng góp mới (theo tuyên bố)
1. **Multimodal temporal KG** kết hợp tri thức không gian và theo thời gian
2. **Multi-scale information retrieval** lấy cảm hứng từ GraphRAG (Edge et al., 2024)
3. **Low-coupling integration** cho phép thay đổi LLM linh hoạt mà không cần fine-tuning

**Ghi chú phê bình**: Đóng góp #2 và #3 là ứng dụng/điều chỉnh các kỹ thuật đã có hơn là phương pháp luận mới:
- Truy hồi đa tỉ lệ được lấy cảm hứng trực tiếp từ GraphRAG
- Low-coupling là lựa chọn thiết kế, không phải đổi mới phương pháp
- **Tính mới thực sự**: Miền ứng dụng (quan hệ xã hội trong video) + kiến trúc tích hợp cụ thể

### Đánh giá khung lý thuyết: ⭐⭐⭐☆☆ (3/5)

**Điểm mạnh**:
- Giải quyết một vấn đề thực tiễn rõ ràng
- Yêu cầu ba thành phần (đồ thị + thời gian + đa phương thức) có cơ sở thuyết phục
- Tích hợp KGs và LLMs được thiết kế có suy nghĩ

**Điểm yếu**:
- **Độ căng khái niệm**: Giả định cốt lõi rằng LLMs “về bản chất” gặp khó với đồ thị bị mâu thuẫn bởi tài liệu được trích
- **Bất nhất trong cách đóng khung**: “Low-coupling” được nêu là điểm mạnh ở phần đóng góp, nhưng lại được thừa nhận là hạn chế (p.10) rằng “limits the depth of collaboration between KGs and LLMs”
- **Tuyên bố về tính mới**: “First to combine KGs and LLMs for social relation recognition in videos” đúng về mặt kỹ thuật nhưng dễ gây hiểu lầm — có nhiều phương pháp tích hợp KG+LLM; tính mới chủ yếu nằm ở miền ứng dụng, không phải phương pháp

## Tổng quan phương pháp

### Kiến trúc khung

| Thành phần | Đầu vào | Quy trình | Đầu ra | LLM sử dụng |
|-----------|-------|---------|--------|----------|
| KG không gian | Khung hình video + phụ đề | Trích xuất đa phương thức bằng MLLM | V_C, V_D, V_I, V_B | GPT-4o |
| KG theo thời gian | V_DT/V_IT trước đó + V_D/V_I/V_B hiện tại | Tóm tắt bằng LLM | V_DT, V_IT đã cập nhật | Nhiều LLM khác nhau |
| Phát hiện cộng đồng | V_DT, V_IT | Thuật toán Leiden trên đồ thị tương tác | Communities COM | N/A |
| Tóm tắt cộng đồng | V_DT^c, V_DI^c theo từng cộng đồng | Tóm tắt bằng LLM | V_CM | Nhiều LLM khác nhau |
| Nhận dạng quan hệ | V_DT^i, V_DT^j, V_IT^(i,j), V_CM | Suy luận bằng LLM | V_S^(i,j) | Nhiều LLM khác nhau |

### Phân loại thực thể

```
V ∈ {V_C, V_D, V_I, V_B, V_DT, V_IT, V_CM, V_S}

Spatial (per-scene):
- V_C: Character entities {v¹_C, v²_C, ..., vⁿ_C}
- V_D: Individual entities (per-character features in scene)
- V_I: Interaction entities (pairwise features in scene)
- V_B: Background entities (scene context, shared across pairs)

Temporal (accumulated):
- V_DT: Temporal individual entities (long-term character memory)
- V_IT: Temporal interaction entities (long-term pairwise memory)

Global:
- V_CM: Community entities (cluster-level summaries)
- V_S: Social relation entities (target predictions)

Knowledge Graph: G = {V, E}
where E = {(vⁱ, r^(i,j), vʲ)} are edges
```

**Lưu ý**: Tác giả dùng “edge” thay vì “relation/relationship” để tránh nhầm với “social relation” — cách dùng thuật ngữ rõ ràng, hợp lý.

### Các phương trình chính

**Phương trình 1: Cấu thành KG không gian**
```
V_spatial = {V_C, V_D, V_I, V_B}
Each v_D links to corresponding v_C
Each v_I links to two v_C entities
```

**Phương trình 2-3: Cập nhật theo thời gian**
```
V_DT = Summ(V_DT, V_D)
V_IT = Summ(V_IT, V_I, V_B)

Where Summ() is LLM-based summarization merging:
- Long-term memory (V_DT, V_IT)
- Short-term memory (V_D, V_I, V_B)
```

**Phương trình 4: Phát hiện cộng đồng**
```
H = Σ_c (e_c - γ K²_c / 2m)

Maximize modularity H where:
- e_c = actual edges in community c
- K_c = sum of degrees in community c
- m = total edges
- γ = resolution parameter

Edge weights = number of interactions (not LLM-generated)
Algorithm: Leiden (Traag et al. 2019)
```

**Phương trình 5: Tóm tắt cộng đồng**
```
V_CM = {summ(V^c_DT, V^c_DI), c ∈ COM}
Summarize temporal + individual entities per community
```

**Phương trình 6: Nhận dạng quan hệ xã hội**
```
v^(i,j)_S = Rec(vⁱ_DT, vʲ_DT, v^(i,j)_IT, V_CM)

LLM inference using:
- Both characters' temporal features
- Their temporal interaction history
- All community summaries (global context)
```

### Chi tiết triển khai

**Xử lý video**:
- **Tách cảnh**: Ngưỡng tương đồng khung hình = 0.6 (⚠ **Không có biện minh** — lựa chọn có vẻ tùy ý)
- **Lấy mẫu khung hình**: 2 fps trong mỗi cảnh
- **Phát hiện nhân vật**: Faster R-CNN đã huấn luyện sẵn (Girshick 2015)
- **Đặc trưng**: ResNet18 (He et al. 2016)
- **Phụ đề**: Có sẵn hoặc trích xuất bằng Netease Jianwai

**Mô hình**:
- **MLLM**: GPT-4o-2024-11-20 (Hurst et al. 2024)
- **Các LLM được thử nghiệm**: GPT-4-0613, Claude-3.5-sonnet, Gemini-1.5-pro, Llama3.1-405b, Doubao-1.5-pro, Qwen-max, DeepSeek-V3
- **Phát hiện cộng đồng**: Thuật toán Leiden
- **Tích hợp**: Tất cả qua API, không triển khai cục bộ, không fine-tuning

### Bộ dữ liệu

 | Dataset | Loại | Độ hạt tác vụ | Loại quan hệ |
 |---------|------|------------------|----------------|
| MovieGraphs | Đoạn phim | Theo cảnh, theo cặp | 8 loại |
| HLVU | Phim/TV | Theo cảnh, theo cặp | 8 loại |
| ViSR | Phim | Theo video, nhãn đơn | 8 loại |
| LVU | Phim | Theo video | 8 loại |

**Relation Types**: Leader-subordinate, Colleague, Service, Parent-offspring, Sibling, Couple, Friend, Opponent

**Lo ngại về tính ngoại suy (external validity)**: Tất cả bộ dữ liệu đều là phim/TV — khả năng khái quát sang các loại video khác (giám sát, mạng xã hội, hội nghị trực tuyến) chưa rõ ràng

### Mức độ chặt chẽ phương pháp tổng thể: ⭐⭐⭐☆☆ (3/5)

**Điểm mạnh**:
1. **Quy trình rõ ràng**: Chuỗi bốn giai đoạn được mô tả rành mạch
2. **Phân loại thực thể toàn diện**: V_C đến V_S bao quát mọi mức độ thông tin
3. **Truy hồi đa tỉ lệ**: Mức cá nhân, tương tác và cộng đồng cung cấp ngữ cảnh phân cấp
4. **Đánh giá trên nhiều LLM**: Thử nghiệm 7 LLM khác nhau để kiểm tra độ vững
5. **Ký hiệu hình thức**: Khung toán học rõ ràng (dù khá nặng ký hiệu)

**Điểm yếu**:
1. **Ngưỡng tùy ý**: Ngưỡng tách cảnh (0.6) không được biện minh — không thấy phân tích độ nhạy được đề cập
2. **Thiếu chi tiết phương pháp**:
   - Prompt cho MLLM được thiết kế thế nào để trích xuất thực thể?
   - Siêu tham số của phát hiện cộng đồng là gì?
   - Cách xử lý khi có mâu thuẫn/xung đột trong truy hồi đa tỉ lệ?
3. **Không fine-tuning**: Được đóng khung như ưu điểm nhưng có thể làm giảm hiệu năng so với mô hình chuyên biệt theo tác vụ
4. **Độ hạt thời gian**: Cập nhật theo mức cảnh có thể bỏ lỡ động lực trong-cảnh
5. **Phụ thuộc API**: API thương mại tạo rủi ro về khả năng tái lập (mô hình thay đổi theo thời gian)

## Tóm tắt các phát hiện chính

### Các khẳng định chính

**Lưu ý**: Kết quả thực nghiệm đầy đủ nằm ở Section 5 (không được cung cấp để phân tích). Dựa trên các khẳng định ở Section 1:

 | Phát hiện | Bằng chứng được cung cấp | Trạng thái | Chất lượng |
 |---------|------------------|--------|---------|
| Hiệu năng SOTA trên 4 bộ dữ liệu | Được dẫn chiếu là Table 1 (không có trong Section 1) | ⚠ Chưa được kiểm chứng trong các phần đã phân tích | Chờ |
| ~15% cải thiện so với SOTA trên MovieGraphs | Có nhắc (p.7) | ⚠ Chưa được kiểm chứng | Chờ |
| Khung kết nối hiệu quả KGs và LLMs | Khẳng định mang tính khái niệm | ⚠ Chỉ mang tính định tính | Khái niệm |
| Low-coupling cho phép thay đổi LLM linh hoạt | Thể hiện qua việc thử nghiệm 7 LLM | ✓ Được hỗ trợ một phần | Kiểm chứng thiết kế |
| Truy hồi đa tỉ lệ cải thiện suy luận | Dẫn chiếu ablation study (Table 5) | ⚠ Chưa được kiểm chứng trong các phần đã phân tích | Chờ |

### Các khẳng định cần được kiểm chứng (Section 5 — Chưa phân tích)

**Kỳ vọng trong bài đầy đủ**:
1. Mức độ chính xác tuyệt đối (không chỉ cải thiện tương đối)
2. Kích thước hiệu ứng (Cohen's d, khoảng tin cậy)
3. Kiểm định ý nghĩa thống kê
4. So sánh với baseline công bằng:
   - **Quan trọng**: SocialGPT (Li et al. 2024) — phương pháp dựa trên LLM cho quan hệ xã hội
   - Truyền thống: Các phương pháp GNN (GCN, PGCN, MSTR, MRR, SGCAT-CT)
   - Embeddings: TSN (Wang et al. 2016)
5. Nghiên cứu ablation: s (chỉ không gian) → s+t (+ theo thời gian) → s+t+c (+ cộng đồng)
6. Phân tích độ nhạy: Ngưỡng tách cảnh, tham số phát hiện cộng đồng
7. Phân tích chi phí tính toán

### Kết luận rút ra
**Các khẳng định có vẻ hợp lý nhưng chưa được kiểm chứng trong phần đã phân tích**. Phần giới thiệu phù hợp khi để kiểm chứng thực nghiệm cho các phần kết quả, nhưng:
- Không có thống kê “xem trước”
- Kích thước hiệu ứng chưa rõ
- Ý nghĩa thực tiễn chưa rõ (cải thiện 15% có “đáng” với chi phí tính toán không?)

## Điểm mạnh

### 1. Điểm mạnh về phương pháp ⭐⭐⭐⭐☆

**Thiết kế khung toàn diện**:
- Bao quát ba chiều: cấu trúc đồ thị, động lực theo thời gian, nội dung đa phương thức
- Quy trình nhiều giai đoạn được tổ chức hợp lý
- Tách bạch vai trò (không gian → thời gian → cộng đồng → suy luận)

**Truy hồi thông tin đa tỉ lệ**:
- Mức cá nhân (V_DT): Đặc trưng theo nhân vật
- Mức tương tác (V_IT): Lịch sử quan hệ theo cặp
- Mức cộng đồng (V_CM): Ngữ cảnh mạng xã hội toàn cục
- Lấy cảm hứng từ GraphRAG nhưng được điều chỉnh cho miền video

**Kiểm thử độ vững**:
- Thử nghiệm 7 LLM khác nhau (GPT-4, Claude, Gemini, Llama, Doubao, Qwen, DeepSeek)
- 6 MLLM khác nhau cho trích xuất (có dẫn chiếu Table 6)
- Thể hiện khả năng khái quát qua các mô hình

### 2. Điểm mạnh về lý thuyết ⭐⭐⭐☆☆

**Định hình vấn đề**:
- Xác định rõ hạn chế của các hướng tiếp cận hiện có
- Yêu cầu ba thành phần (đồ thị + thời gian + đa phương thức) có động cơ tốt

**Cân bằng đánh đổi trong thiết kế**:
- Tránh dùng KG bên ngoài để tăng khả năng khái quát
- Thừa nhận low-coupling là hạn chế (p.10) — mức độ thẳng thắn hiếm gặp

### 3. Điểm mạnh về trình bày ⭐⭐⭐⭐☆

**Tổng quan tài liệu**:
- Cấu trúc ba phần (Social Relation Recognition, Multimodal/Temporal KGs, Unifying KGs and LLMs)
- Định vị tương đối công bằng với các công trình trước
- Trích dẫn mới và phù hợp

**Ký hiệu hình thức**:
- Phân loại thực thể rõ ràng
- Phương trình toán học cho từng giai đoạn
- Rõ ràng về thuật ngữ (“edge” vs “relation”)

**Minh bạch**:
- Có mục Limitations (hiếm!)
- Hứa công bố mã nguồn
- Thừa nhận các đánh đổi trong thiết kế

### 4. Điểm mạnh thực tiễn ⭐⭐⭐☆☆

**Tính mô-đun**:
- Có thể thay đổi LLM mà không cần huấn luyện lại
- Giảm yêu cầu phần cứng (không fine-tuning)
- Kiến trúc linh hoạt

**Bộ chuẩn công khai**:
- Bốn bộ dữ liệu đã được dùng rộng rãi
- So sánh công bằng với các công trình trước
- Đánh giá có thể tái lập

## Hạn chế & đe dọa đến tính hợp lệ

### Vấn đề nghiêm trọng 🔴

#### 1. Mâu thuẫn lý thuyết: năng lực suy luận đồ thị của LLM

**Vấn đề**: Động cơ cốt lõi mâu thuẫn với bằng chứng được trích
- **Khẳng định**: “LLMs encounter significant challenges… due to reliance on sequential training data, which inherently restricts their capacity to effectively model complex graph-structured relationships”
- **Bằng chứng phản biện (ngay trong bài)**: Chakraborty (2024) được trích ở Sec.2.3 cho thấy “strong potential of LLMs in multi-hop reasoning over knowledge graphs”

**Tác động**:
- Khiến tính tất yếu của tích hợp KG bị nghi ngờ
- Cách giải thích khác: LLMs *có thể* xử lý đồ thị với prompting phù hợp; vấn đề là phương pháp, không phải kiến trúc
- Khung vẫn có thể hiệu quả, nhưng biện minh lý thuyết không vững

**Mức độ**: 🔴 **Critical** — làm suy yếu động cơ cốt lõi
**Tác giả có thừa nhận**: Không — độ căng này không được đề cập

#### 2. Không công bố chi phí tính toán ngay từ đầu

**Vấn đề**: Việc sử dụng LLM API nặng không được nêu trong phần giới thiệu
- Nhiều lần gọi LLM cho mỗi video: trích xuất (GPT-4o) + cập nhật theo thời gian + tóm tắt cộng đồng + nhận dạng quan hệ
- Video 10 phút = 122.2 giây (tuần tự) hoặc 12.2 giây (batch) theo Section 5.4
- Phân tích chi phí được để đến Section 5.4, sau các kết quả chính

**Tác động**:
- Người đọc không thể đánh giá đánh đổi chi phí–lợi ích khi xem các khẳng định
- Tính khả thi triển khai thực tế chưa rõ
- Cải thiện 15% có thể không đáng so với chi phí tính toán

**Mức độ**: 🔴 **Critical** — ảnh hưởng tính ứng dụng
**Tác giả có thừa nhận**: Có, nhưng chỉ ở Section 5.4 (quá muộn)

#### 3. Không có phân tích độ nhạy cho các ngưỡng quan trọng

**Vấn đề**: Ngưỡng tách cảnh (0.6) có vẻ tùy ý
- Tham số then chốt ảnh hưởng đến độ hạt theo thời gian
- Không có biện minh
- Không thấy nhắc đến phân tích độ nhạy

**Tác động**:
- Kết quả có thể nhạy với lựa chọn này
- Video khác nhau có thể cần ngưỡng khác nhau
- Khả năng khái quát chưa rõ

**Mức độ**: 🟡 **Moderate** — lo ngại về phương pháp
**Tác giả có thừa nhận**: Không

### Vấn đề mức trung bình 🟡

#### 4. Tính ngoại suy: phim so với video nói chung

**Vấn đề**: Tất cả bộ dữ liệu là phim/TV
- Nội dung có kịch bản, được dựng/chỉnh sửa, chuyên nghiệp
- Khẳng định về “general videos” chưa được kiểm chứng
- Khả năng khái quát sang giám sát, mạng xã hội, hội nghị trực tuyến chưa rõ

**Tác động**: Tính ngoại suy bị giới hạn

**Mức độ**: 🟡 **Moderate**
**Tác giả có thừa nhận**: Có — tác giả nói tập trung vào “general videos” nhưng chỉ thử nghiệm trên phim

#### 5. Bất nhất khi đóng khung “low-coupling”

**Vấn đề**: “Low-coupling” được coi là điểm mạnh trong phần đóng góp, nhưng là hạn chế ở Sec.6
- Mở đầu: Nhấn mạnh tính linh hoạt, không cần fine-tuning
- Limitations (p.10): “low coupling pattern… limits the depth of collaboration between KGs and LLMs”

**Tác động**: Bất nhất tu từ gây mơ hồ về việc đây là tính năng hay lỗi

**Mức độ**: 🟡 **Moderate** — độ căng khái niệm
**Tác giả có thừa nhận**: Có, trong Limitations

#### 6. Đe dọa tái lập: phụ thuộc API

**Vấn đề**: API thương mại (GPT-4o, v.v.) thay đổi theo thời gian
- Kết quả có thể không tái lập sau vài tháng/năm
- Rào cản chi phí để tái lập đầy đủ
- Truy cập API có thể bị hạn chế ở một số khu vực

**Tác động**: Tính không ổn định theo thời gian của kết quả

**Mức độ**: 🟡 **Moderate** — lo ngại tái lập
**Tác giả có thừa nhận**: Không

#### 7. Độ hạt thời gian: mức cảnh có thể quá thô

**Vấn đề**: Cập nhật KG theo từng cảnh, không theo sự kiện hay khung hình
- Những thay đổi quan hệ quan trọng giữa chừng trong-cảnh có thể bị bỏ lỡ
- Lỗi tách cảnh có thể lan truyền

**Tác động**: Mô hình theo thời gian có thể bỏ lỡ động lực tinh vi

**Mức độ**: 🟡 **Moderate** — hạn chế thiết kế
**Tác giả có thừa nhận**: Không

### Vấn đề nhỏ 🟢

#### 8. Tuyên bố tính mới: “First” khi kết hợp KGs và LLMs

**Vấn đề**: Có nhiều phương pháp tích hợp KG+LLM (được trích trong Related Work)
- GraphRAG (Edge et al. 2024)
- Chakraborty (2024) về suy luận đồ thị của LLM
- SocialGPT (Li et al. 2024) cho quan hệ xã hội

**Làm rõ**: Tác giả là người đầu tiên *cho tác vụ cụ thể này* (nhận dạng quan hệ xã hội trong video), chứ không phải người đầu tiên về tích hợp KG+LLM nói chung

**Tác động**: Nhỏ — khẳng định đúng kỹ thuật nhưng có thể gây hiểu lầm

**Mức độ**: 🟢 **Minor** — vấn đề cách diễn đạt
**Tác giả có thừa nhận**: Không

#### 9. Thiếu chi tiết phương pháp

**Vấn đề**: Prompt không được trình bày ở Section 1 (được để sang Appendix D)
- Quan trọng cho việc tái lập
- Prompt engineering là then chốt cho hiệu năng LLM

**Tác động**: Không thể đánh giá đầy đủ phương pháp nếu thiếu prompt

**Mức độ**: 🟢 **Minor** — thông tin được hoãn, không hẳn là thiếu
**Tác giả có thừa nhận**: Có — dẫn chiếu Appendix D

### Đánh giá tính hợp lệ

 | Loại hợp lệ | Xếp hạng | Lý do |
 |--------------|--------|-----------|
| **Tính hợp lệ nội bộ** | ⭐⭐⭐☆☆ | Thiết kế tốt, nhưng có ngưỡng tùy ý và thiếu ablation trong phần đã phân tích |
| **Tính hợp lệ ngoại suy** | ⭐⭐☆☆☆ | Giới hạn ở phim/TV; khái quát sang loại video khác chưa rõ |
| **Tính hợp lệ kết luận thống kê** | ⭐⭐⭐☆☆ | Chưa thể đánh giá đầy đủ — kết quả thực nghiệm ở Section 5 chưa phân tích; phương pháp mô tả có vẻ phù hợp |
| **Tính hợp lệ khái niệm** | ⭐⭐⭐☆☆ | Quan hệ xã hội được định nghĩa tốt; lưỡng phân “graph vs sequential” bị đơn giản hóa quá mức |

**Tính hợp lệ tổng thể**: ⭐⭐⭐☆☆ (3/5) — mức trung bình, còn các lo ngại

## Đánh giá phê bình

### Những điểm bài báo làm đặc biệt tốt

1. **Tổng quan tài liệu toàn diện** (⭐⭐⭐⭐⭐)
   - Cấu trúc ba phần bao quát các mảng liên quan khá đầy đủ
   - Định vị tương đối công bằng với công trình trước
   - Trích dẫn mới

2. **Định hình vấn đề rõ ràng** (⭐⭐⭐⭐☆)
   - Yêu cầu ba thành phần có động cơ tốt
   - Tính liên quan thực tiễn rõ
   - Xác định khoảng trống có hệ thống

3. **Thiết kế khung hình thức** (⭐⭐⭐⭐☆)
   - Phân loại thực thể toàn diện
   - Ký hiệu toán học rõ
   - Quy trình nhiều giai đoạn hợp lý

4. **Minh bạch về hạn chế** (⭐⭐⭐⭐☆)
   - Hiếm khi thấy phần Limitations rõ ràng
   - Thừa nhận đánh đổi low-coupling
   - Trung thực về lựa chọn thiết kế

5. **Kiểm thử độ vững đa mô hình** (⭐⭐⭐⭐☆)
   - Thử nghiệm 7 LLM
   - Cho thấy khả năng khái quát qua các mô hình

### Những điểm có thể cải thiện

#### Phương pháp
1. **Biện minh các ngưỡng tùy ý** (tách cảnh = 0.6)
   - Cung cấp phân tích độ nhạy
   - Giải thích cách chọn ngưỡng
   - Kiểm tra độ vững khi thay đổi tham số

2. **Độ hạt thời gian mịn hơn**
   - Cân nhắc tách theo sự kiện hoặc tách cảnh thích ứng
   - Xử lý động lực trong-cảnh
   - Phân tích lỗi khi tách cảnh thất bại

3. **Nêu đánh đổi chi phí–lợi ích ngay từ đầu**
   - Chi phí tính toán nên có ở phần giới thiệu, không phải Section 5
   - Phân tích chi phí theo mỗi video
   - Cân nhắc triển khai thực tế

4. **Lựa chọn tích hợp chặt hơn**
   - Khảo sát các phương án thay cho low-coupling
   - Cách tiếp cận lai với fine-tuning có chọn lọc
   - Tương tác hai chiều KG ↔ LLM

#### Phân tích
1. **Báo cáo kích thước hiệu ứng, không chỉ p-value**
   - Cohen's d hoặc thước đo tương tự
   - Khoảng tin cậy
   - Đánh giá ý nghĩa thực tiễn

2. **So sánh baseline công bằng**
   - Bao gồm baseline chỉ dùng LLM (ví dụ: SocialGPT)
   - Ablation có/không có KG bên ngoài
   - Thước đo hiệu năng đã chuẩn hóa theo chi phí

3. **Phân tích trường hợp thất bại**
   - Những loại quan hệ nào khó nhất?
   - Khi nào khung thất bại?
   - Mẫu lỗi theo đặc tính video

#### Diễn giải
1. **Hòa giải mâu thuẫn lý thuyết**
   - Thảo luận bằng chứng về năng lực suy luận đồ thị của LLM
   - Làm rõ “tính tất yếu” so với “tính hiệu quả”
   - Phân biệt hạn chế căn bản và hạn chế phương pháp

2. **Khẳng định tính mới rõ hơn**
   - “Ứng dụng đầu tiên” so với “phương pháp đầu tiên”
   - Nêu rõ phần nào được điều chỉnh từ công trình trước (GraphRAG)
   - Định vị như đóng góp kỹ nghệ, không thuần khoa học

3. **Thảo luận tính ngoại suy**
   - Nếu có thể, thử trên video không phải phim
   - Thảo luận kỳ vọng hiệu năng ở miền khác
   - Thừa nhận giới hạn khái quát

### Các cách giải thích thay thế

#### 1. Cách tiếp cận chỉ dùng LLM có thể đủ

**Giả thuyết thay thế**: Prompting phù hợp + tuần tự hóa đồ thị (graph serialization) mà không cần KG tường minh
- **Tính hợp lý**: Cao — Chakraborty (2024) cho thấy LLMs có thể suy luận multi-hop trên đồ thị
- **Cách kiểm tra**: Baseline chỉ LLM (ví dụ: SocialGPT Li et al. 2024) với prompt được thiết kế kỹ
- **Phản hồi kỳ vọng từ tác giả**: Nên đưa baseline này vào thí nghiệm

#### 2. KG bên ngoài sẽ cải thiện hiệu năng

**Giả thuyết thay thế**: Dùng tri thức bên ngoài (ví dụ: movie wikis, IMDB) cho các phim nổi tiếng
- **Tính hợp lý**: Cao — ứng dụng thực tế thường tận dụng tri thức sẵn có
- **Cách kiểm tra**: Ablation có/không có KG bên ngoài
- **Phản hồi từ tác giả**: Cố ý tránh để tăng khả năng khái quát — lựa chọn hợp lý, nhưng làm yếu so sánh hiệu năng

#### 3. Fine-tuning sẽ vượt low-coupling

**Giả thuyết thay thế**: Fine-tuning theo tác vụ trên dữ liệu quan hệ xã hội
- **Tính hợp lý**: Cao — mô hình fine-tuned thường vượt zero-shot
- **Cách kiểm tra**: So sánh low-coupling với baseline fine-tuned
- **Phản hồi từ tác giả**: Chọn low-coupling vì linh hoạt; thừa nhận là hạn chế (p.10)

#### 4. Cải thiện đến từ đặc trưng thị giác tốt hơn, không phải KG

**Giả thuyết thay thế**: Việc dùng GPT-4o (MLLM mạnh) là nguyên nhân chính tạo hiệu năng, không phải cấu trúc KG
- **Tính hợp lý**: Trung bình — GPT-4o rất mạnh
- **Cách kiểm tra**: Ablation suy luận trực tiếp bằng GPT-4o so với quy trình mtKG-LLM
- **Phản hồi từ tác giả**: Nên có trong ablation studies

### Câu hỏi còn bỏ ngỏ

**Về phương pháp**:
1. Nhạy thế nào với ngưỡng tách cảnh (0.6)?
2. Cách chọn tham số phát hiện cộng đồng (resolution γ)?
3. Prompt chính xác cho từng giai đoạn là gì? (Appendix D — chưa phân tích)
4. Xử lý xung đột trong truy hồi đa tỉ lệ ra sao?

**Về thực nghiệm**:
1. Mức chính xác tuyệt đối là bao nhiêu (không chỉ cải thiện tương đối)?
2. Cải thiện có ý nghĩa thống kê không?
3. Kích thước hiệu ứng là bao nhiêu?
4. So sánh với baseline chỉ LLM thế nào?
5. Những loại quan hệ nào hưởng lợi nhiều nhất từ tích hợp KG?

**Về thực tiễn**:
1. Chi phí cho mỗi video là bao nhiêu?
2. Hiệu năng thay đổi theo độ dài video thế nào?
3. Tỉ lệ lỗi của tách cảnh là bao nhiêu?
4. Có thể chạy thời gian thực không?

**Về lý thuyết**:
1. Vì sao KG giúp nếu LLM đã có thể suy luận trên đồ thị?
2. Mức độ “coupling” tối ưu giữa KG và LLM là gì?
3. Cơ chế là tăng năng lực hay tăng hiệu quả?

## Đánh giá khả năng tái lập

### Danh sách kiểm tra tái lập

- [x] **Phương pháp được mô tả đủ chi tiết** (cho quy trình tổng quan; prompt ở phụ lục)
- [ ] **Có báo cáo power analysis** (❌ Không nhắc)
- [x] **Dữ liệu sẵn có** (✓ Bộ chuẩn công khai: MovieGraphs, HLVU, ViSR, LVU)
- [x] **Mã nguồn sẵn có** (✓ Hứa công bố tại https://github.com/HarryWgCN/mtKG-LLM)
- [ ] **Vật liệu/kích thích sẵn có** (⚠ Dùng bộ dữ liệu có sẵn; prompt ở Appendix D — chưa phân tích đầy đủ)
- [ ] **Pre-registered** (N/A — không phổ biến với bài ML)

### Yếu tố hỗ trợ tái lập ✓
1. Dùng bộ dữ liệu công khai
2. Hứa công bố mã nguồn
3. Mô tả thuật toán rõ ràng
4. Thử nghiệm nhiều mô hình (thể hiện khả năng khái quát)
5. Hệ thống ký hiệu hình thức

### Rào cản tái lập ❌
 1. **Phụ thuộc API thương mại**: GPT-4o, Claude, Gemini APIs
   - Mô hình thay đổi theo thời gian
   - Quyền truy cập API có thể bị hạn chế
   - Thay đổi giá có thể ảnh hưởng khả năng tiếp cận
2. **Rào cản chi phí**: Nhiều lần gọi LLM API cho mỗi video
   - Video 10 phút ≈ 5800 tokens được nhắc
   - Nhiều giai đoạn → chi phí đáng kể
3. **Không ổn định theo thời gian**: Kết quả có thể khác khi API cập nhật
4. **Thiếu chi tiết**: Prompt chính xác ở phụ lục chưa được phân tích
5. **Tham số tùy ý**: Ngưỡng cảnh (0.6), tham số phát hiện cộng đồng không được biện minh đầy đủ

### Khả năng tái lập tổng thể: ⭐⭐⭐☆☆ (3/5) — Trung bình

**Khả năng tái lập**: Trung bình
- ✓ Dữ liệu công khai + hứa công bố mã → có thể tái lập thuật toán
- ⚠ Phụ thuộc API → khó tái lập đúng kết quả
- ⚠ Rào cản chi phí → tái lập đầy đủ tốn kém
- ⚠ Prompt engineering quan trọng → biến thiên nhỏ cũng có thể ảnh hưởng kết quả

**Khuyến nghị**:
- **Tái lập học thuật**: Khả thi nếu có quyền truy cập API và ngân sách
- **Triển khai công nghiệp**: Cần hạ tầng gọi API + quản trị chi phí
- **Ổn định dài hạn**: Đáng nghi ngờ do API thay đổi

## Đóng góp cho lĩnh vực

### Đóng góp lý thuyết: ⭐⭐⭐☆☆

**Đóng góp cho lý thuyết bằng cách**:
- Hình thức hóa yêu cầu ba thành phần cho nhận dạng quan hệ xã hội trong video
- Đề xuất kiến trúc tích hợp cho KGs và LLMs

**Đánh giá phê bình**:
- ⚠ Khẳng định lý thuyết cốt lõi (LLMs không xử lý được đồ thị) bị mâu thuẫn bởi bằng chứng trích dẫn
- ⚠ Khung là đóng góp kỹ nghệ nhiều hơn là đổi mới lý thuyết
- ✓ Phân tích có hệ thống các đánh đổi của cách tiếp cận hiện có

**Tác động**: Trung bình — thiên về ứng dụng hơn là lý thuyết

### Đóng góp phương pháp: ⭐⭐⭐⭐☆

**Giới thiệu**:
1. Xây dựng KG theo thời gian đa phương thức cho video
2. Truy hồi đa tỉ lệ được điều chỉnh cho miền video (lấy cảm hứng từ GraphRAG)
3. Kiến trúc tích hợp low-coupling

**Đánh giá phê bình**:
- ✓ Thiết kế quy trình rõ ràng
- ✓ Phân loại thực thể toàn diện
- ⚠ Truy hồi đa tỉ lệ được điều chỉnh từ GraphRAG, không hoàn toàn mới
- ⚠ Low-coupling là lựa chọn thiết kế, không phải đổi mới phương pháp
- ✓ Ứng dụng cho miền video là mới

**Tác động**: Đóng góp phương pháp mạnh *trong miền này*

### Đóng góp thực nghiệm: ⚠ Chưa thể đánh giá đầy đủ

**Khẳng định** (cần kiểm chứng ở Section 5):
- Hiệu năng SOTA trên 4 bộ chuẩn
- ~15% cải thiện trên MovieGraphs
- Độ vững trên 7 LLM

**Đánh giá phê bình**:
- Cần xem: kích thước hiệu ứng, kiểm định ý nghĩa, so sánh baseline
- Cần ablation để xác thực đóng góp của từng thành phần
- Cần phân tích chi phí–lợi ích

**Tác động**: Có thể cao nếu các khẳng định được kiểm chứng

### Hệ quả thực tiễn: ⭐⭐⭐☆☆

**Đối với người thực hành**:
- Minh họa mẫu tích hợp KG+LLM cho hiểu video
- Thiết kế mô-đun giúp thay đổi thành phần
- Truy hồi đa tỉ lệ tăng khả năng diễn giải

**Đối với ứng dụng**:
- Phân tích nội dung video
- Trích xuất mạng xã hội từ video
- Gán nhãn quan hệ tự động

**Hạn chế**:
- Chi phí tính toán có thể quá cao khi triển khai quy mô lớn
- Phụ thuộc API tạo rủi ro vận hành
- Chỉ kiểm chứng trên phim — miền khác chưa rõ

**Tác động**: Trung bình — hữu ích cho nghiên cứu, nhưng triển khai thực tế gặp thách thức

### Tác động tổng thể: 🔥🔥🔥☆☆ (3/5) — Tác động mức trung bình đến cao

**Điểm mạnh**:
- Giải quyết vấn đề thực tiễn với cách tiếp cận rõ ràng
- Đánh giá toàn diện trên nhiều mô hình và bộ dữ liệu
- Minh bạch về hạn chế
- Công bố mã nguồn có lợi cho cộng đồng

**Hạn chế**:
- Động cơ lý thuyết không vững
- Chi phí tính toán hạn chế việc áp dụng thực tế
- Tính ngoại suy chưa rõ
- Tính mới nghiêng về ứng dụng hơn là phát minh

## Vị trí trong văn liệu

### Dựa trên

**Knowledge Graphs**:
- Newman & Girvan (2004): Modularity cho phát hiện cộng đồng
- Traag et al. (2019): Thuật toán Leiden
- Văn liệu KG đa phương thức (Zeng et al. 2022, v.v.)
- Văn liệu KG theo thời gian (Cai et al. 2018, Rossi et al. 2021)

**Large Language Models**:
- GPT-4 (OpenAI 2023): Mô hình nền tảng
- Chain-of-thought reasoning
- Multimodal LLMs (GPT-4o, v.v.)

**KG + LLM Integration**:
- **GraphRAG** (Edge et al. 2024): Truy hồi đa tỉ lệ theo cộng đồng → *nguồn cảm hứng trực tiếp*
- Chakraborty (2024): LLMs cho suy luận đồ thị
- Pan et al. (2024): Unifying KGs and LLMs

**Social Relation Recognition**:
- Phương pháp embedding: TSN (Wang et al. 2016)
- Phương pháp GNN: GCN, PGCN, MSTR, MRR, SGCAT-CT
- Công trình LLM gần đây: SocialGPT (Li et al. 2024)

### Thúc đẩy lĩnh vực bằng cách

1. **Miền ứng dụng**: Đầu tiên áp dụng tích hợp KG+LLM cụ thể cho nhận dạng quan hệ xã hội trong video
2. **Mô hình hóa theo thời gian**: Cập nhật KG theo từng cảnh để nắm bắt động lực video
3. **Kiến trúc đa tỉ lệ**: Mức cá nhân, tương tác, và cộng đồng
4. **Kiểm chứng thực nghiệm**: Thử nghiệm trên 4 bộ dữ liệu và 7 LLM (nếu khẳng định được kiểm chứng)

### Được trích dẫn bởi (tác động kỳ vọng)

**Có khả năng được trích dẫn vì**:
- Mẫu tích hợp KGs và LLMs cho các miền đa phương thức
- Truy hồi đa tỉ lệ cho hiểu video
- Bộ chuẩn/thiết lập cho nhận dạng quan hệ xã hội

**Các lo ngại có thể làm giảm trích dẫn**:
- Chi phí tính toán có thể làm nản lòng việc áp dụng
- Phụ thuộc API làm giảm khả năng tái lập
- Vấn đề động cơ lý thuyết có thể bị thách thức

### Mâu thuẫn với

**Mâu thuẫn ngầm** (không được thừa nhận trực tiếp):
- Chakraborty (2024) và các công trình khác cho thấy LLMs *có thể* suy luận đồ thị
- Tác giả khẳng định LLMs khó với đồ thị, nhưng lại trích dẫn bằng chứng ngược lại

**Độ căng này nên được giải quyết trong các công trình tương lai**

## Hướng nghiên cứu tương lai

### Được tác giả gợi ý (từ Limitations, p.10)

1. **Khắc phục hạn chế low-coupling**: Khảo sát tích hợp chặt hơn giữa KGs và LLMs
2. **Hiệu quả tính toán**: Tối ưu cho video dài và xử lý thời gian thực
3. **Khả năng khái quát**: Thử nghiệm trên nhiều loại video hơn ngoài phim

### Các bước tiếp theo quan trọng (đánh giá của tôi)

#### Ưu tiên cao 🔴

1. **Hòa giải mâu thuẫn lý thuyết**
   - So sánh thực nghiệm giữa baseline chỉ LLM (với prompting phù hợp) và mtKG-LLM
   - Làm rõ liệu KG mang lại tăng năng lực hay tăng hiệu quả
   - Nghiên cứu cơ chế: Vì sao KG giúp?

2. **Phân tích chi phí–lợi ích**
   - Báo cáo chi phí theo mỗi video
   - So sánh hiệu năng so với chi phí tính toán của baseline
   - Xác định khi nào phần “overhead” là đáng giá

3. **Phân tích độ nhạy**
   - Biến thiên ngưỡng tách cảnh
   - Tinh chỉnh tham số phát hiện cộng đồng
   - Độ vững với lựa chọn siêu tham số

4. **Nghiên cứu tính ngoại suy**
   - Thử trên video không phải phim (giám sát, mạng xã hội, hội nghị)
   - Đánh giá khái quát vượt nội dung có kịch bản
   - Chiến lược thích nghi miền

#### Ưu tiên trung bình 🟡

5. **Khảo sát coupling lai**
   - Fine-tuning có chọn lọc cho thành phần quan trọng
   - Tương tác hai chiều KG ↔ LLM
   - Phân tích mức coupling tối ưu

6. **Cải thiện độ hạt theo thời gian**
   - Cập nhật theo sự kiện thay vì theo cảnh
   - Phân đoạn thời gian thích ứng
   - Mô hình hóa động lực trong-cảnh

7. **Phân tích chế độ thất bại**
   - Đặc trưng hóa khi nào khung thất bại
   - Phân tích độ khó theo loại quan hệ
   - Ảnh hưởng của đặc tính video (độ dài, độ phức tạp, thể loại)

8. **Nghiên cứu prompt engineering**
   - Ablation các lựa chọn thiết kế prompt
   - Cấu trúc prompt tối ưu cho từng giai đoạn
   - Khả năng chuyển prompt giữa các LLM

#### Ưu tiên thấp 🟢

9. **Triển khai LLM cục bộ**
   - Giảm phụ thuộc API bằng mô hình mã nguồn mở
   - Triển khai on-premises cho nội dung nhạy cảm
   - Chiến lược giảm chi phí

10. **Xử lý thời gian thực**
    - Hỗ trợ video streaming
    - Cập nhật KG gia tăng
    - Tối ưu độ trễ

11. **Hiệu chỉnh tương tác**
    - Human-in-the-loop để sửa lỗi
    - Active learning cho trường hợp khó
    - Tích hợp phản hồi người dùng

12. **Mở rộng liên phương thức**
    - Tích hợp đặc trưng âm thanh
    - Phân tích biểu cảm khuôn mặt
    - Mô hình hóa ngôn ngữ cơ thể

## Các điểm rút ra chính

### Các điểm chính

1. **Thiết kế khung** (⭐⭐⭐⭐☆):
   - mtKG-LLM cung cấp một quy trình rõ ràng để kết hợp KGs và LLMs cho nhận dạng quan hệ xã hội trong video
   - Truy hồi đa tỉ lệ (cá nhân, tương tác, cộng đồng) có động cơ tốt
   - Phân loại thực thể hình thức toàn diện

2. **Động cơ lý thuyết** (⭐⭐☆☆☆):
   - **Lưu ý**: Khẳng định cốt lõi rằng “LLMs struggle with graphs” bị mâu thuẫn bởi tài liệu trích dẫn (Chakraborty 2024)
   - Có thể là vấn đề phương pháp hơn là hạn chế căn bản
   - Khung có thể vẫn hiệu quả, nhưng biện minh cần được tinh chỉnh

3. **Tính ứng dụng thực tiễn** (⭐⭐⭐☆☆):
   - **Lưu ý**: Chi phí tính toán cao (nhiều lần gọi LLM API cho mỗi video)
   - Đánh đổi chi phí–lợi ích chưa rõ nếu không có phân tích chi phí đầy đủ
   - Phụ thuộc API tạo rủi ro vận hành

4. **Kiểm chứng thực nghiệm** (⚠ Chưa thể đánh giá):
   - Khẳng định hiệu năng SOTA với ~15% cải thiện
   - **Chờ**: Kích thước hiệu ứng, kiểm định ý nghĩa, so sánh baseline công bằng ở Section 5

5. **Đóng góp phương pháp** (⭐⭐⭐⭐☆):
   - Đóng góp kỹ nghệ mạnh trong miền video
   - Điều chỉnh hiệu quả truy hồi đa tỉ lệ kiểu GraphRAG
   - Đánh giá toàn diện trên nhiều mô hình (7 LLM)

6. **Khả năng tái lập** (⭐⭐⭐☆☆):
   - Dữ liệu công khai + hứa công bố mã nguồn
   - **Lưu ý**: Phụ thuộc API hạn chế việc tái lập chính xác
   - Rào cản chi phí cho tái lập đầy đủ

### Lưu ý & ghi chú phê bình

1. **Bất nhất lý thuyết**: Khẳng định hạn chế LLM cốt lõi vs. bằng chứng trích dẫn
2. **Chi phí tính toán**: Không nêu ngay từ đầu; có thể quá cao khi triển khai quy mô lớn
3. **Đánh đổi low-coupling**: Được đóng khung là điểm mạnh nhưng thừa nhận là hạn chế
4. **Tính ngoại suy**: Chỉ phim — miền video khác chưa rõ
5. **Tham số tùy ý**: Ngưỡng cảnh (0.6) không được biện minh
6. **Tuyên bố tính mới**: “First” mang tính miền ứng dụng, không phải phương pháp
7. **API không ổn định**: Kết quả có thể không tái lập theo thời gian

### Ai nên dùng công trình này?

**Khuyến nghị cho**:
- Nhà nghiên cứu về hiểu video + Social AI
- Người thực hành cần trích xuất quan hệ xã hội từ video (có ngân sách API)
- Kỹ sư muốn khảo sát mẫu tích hợp KG+LLM

**Không khuyến nghị cho**:
- Ứng dụng thời gian thực (lo ngại độ trễ)
- Triển khai nhạy cảm chi phí (gọi API đắt)
- Miền nhạy cảm quyền riêng tư (phụ thuộc API bên ngoài)
- Video không phải phim (cần kiểm chứng trước)

### Kết luận ngắn gọn

**Mức độ tin cậy**: ⭐⭐⭐☆☆ (Mức tin cậy vừa phải)
- Thiết kế khung tốt và được thực thi chỉn chu
- Động cơ lý thuyết đáng nghi ngờ
- Cần kiểm chứng thực nghiệm (Section 5 chưa phân tích)
- Triển khai thực tế có rào cản đáng kể

**Khuyến nghị trích dẫn**: Có, nhưng kèm lưu ý
- Vì: Mẫu tích hợp KG+LLM, truy hồi đa tỉ lệ, nhận dạng quan hệ xã hội trong video
- Lưu ý: Chi phí tính toán, giới hạn ngoại suy, độ căng lý thuyết

**Mức chất lượng**: **Đóng góp phương pháp mạnh** với điểm yếu về lý thuyết
- Không phải đột phá về lý thuyết, nhưng kỹ nghệ vững
- Đánh giá toàn diện (nhiều mô hình, nhiều bộ dữ liệu)
- Minh bạch về hạn chế (hiếm!)

## Ghi chú cá nhân

### Độ tin cậy: ⭐⭐⭐⭐☆ (4/5)

**Vì sao nên tin**:
- Tổng quan tài liệu toàn diện
- Trung thực về hạn chế
- Thử nghiệm nhiều mô hình để kiểm tra độ vững
- Phương pháp rõ ràng
- Hứa công bố mã nguồn

**Vì sao hoài nghi**:
- Mâu thuẫn lý thuyết không được giải quyết
- Phân tích chi phí bị hoãn đến các phần sau
- Kết quả thực nghiệm ở Section 5 chưa phân tích
- Tuyên bố tính mới hơi quá tay

### Mức độ liên quan với nghiên cứu hiểu video

**Rất liên quan cho**:
- Social AI và mô hình hóa quan hệ
- Phân tích video đa phương thức
- Mẫu tích hợp KG + LLM

**Các insight chính**:
1. Truy hồi đa tỉ lệ (cá nhân, tương tác, cộng đồng) cung cấp ngữ cảnh phân cấp
2. Cập nhật KG theo thời gian có thể mô hình hóa quan hệ biến đổi
3. Thiết kế low-coupling tăng linh hoạt nhưng giới hạn hiệu năng
4. Độ hạt theo mức cảnh cân bằng chi phí và độ phân giải thời gian

**Cần thận trọng**:
- Không nên giả định LLM “về bản chất” không xử lý được đồ thị
- Chi phí tính toán là đáng kể
- Tính ngoại suy ngoài phim còn chưa chắc chắn

### Các bài nên đọc tiếp

**Nền tảng lý thuyết**:
1. **Chakraborty (2024)**: LLMs cho suy luận đồ thị multi-hop (được trích nhưng mâu thuẫn với khẳng định cốt lõi)
2. **Edge et al. (2024)**: GraphRAG — nguồn cảm hứng trực tiếp cho truy hồi đa tỉ lệ
3. **Pan et al. (2024)**: Unifying KGs and LLMs (khảo sát tích hợp rộng hơn)

**Baseline để so sánh**:
1. **Li et al. (2024)**: SocialGPT — LLM cho quan hệ xã hội (baseline liên quan nhất)
2. **Các phương pháp GNN**: SGCAT-CT, MRR, MSTR cho hướng tiếp cận dựa trên đồ thị

**Mở rộng**:
1. Các bài gần đây trích dẫn công trình này (khi có) — được mở rộng ra sao?
2. Các khảo sát hiểu video — công trình này đứng ở đâu trong bức tranh lớn?

### Câu hỏi cho điều tra trong tương lai

1. LLM được prompt tốt có thể đạt hiệu năng tương đương mà không cần KG không?
2. Chi phí thực tế theo mỗi video ở quy mô lớn là bao nhiêu?
3. Hiệu năng suy giảm thế nào trên video không phải phim?
4. Mức coupling tối ưu cho tích hợp KG+LLM là gì?
5. LLM mã nguồn mở chạy cục bộ có thể đạt kết quả tương đương không?

---

## Phụ lục: Thống kê tóm tắt

### Phạm vi phân tích
- **Các phần đã phân tích**: 1 (Introduction + Related Work + Preliminaries)
- **Tổng số phần trong bài**: Có thể là 6-7 (Introduction, Related Work, Preliminaries, Method, Experiments, Discussion, Conclusion)
- **Mức bao phủ**: ~15-20% nội dung bài
- **Thiếu quan trọng**: Phương pháp chi tiết (Section 4), kết quả thực nghiệm (Section 5), thảo luận (Section 6)

### Tham chiếu phân loại thực thể
```
Spatial (per-scene):
  V_C: Characters
  V_D: Individual features
  V_I: Interaction features
  V_B: Background context

Temporal (accumulated):
  V_DT: Temporal individual memory
  V_IT: Temporal interaction memory

Global:
  V_CM: Community summaries
  V_S: Social relations (target)

Pipeline:
Video → Scenes → Spatial KG → Temporal KG → Communities → V_CM → Social Relations
```

### Tham chiếu bộ dữ liệu
 | Dataset | Độ hạt | Loại | Quan hệ |
 |---------|-------------|------|-----------|
 | MovieGraphs | Theo cảnh | Theo cặp | 8 loại |
 | HLVU | Theo cảnh | Theo cặp | 8 loại |
 | ViSR | Theo video | Nhãn đơn | 8 loại |
 | LVU | Theo video | Nhãn đa | 8 loại |

**Relation Types**: Leader-sub, Colleague, Service, Parent-offs, Sibling, Couple, Friend, Opponent

### Các mô hình được dùng
- **MLLM**: GPT-4o-2024-11-20
- **LLMs**: GPT-4-0613, Claude-3.5-sonnet, Gemini-1.5-pro, Llama3.1-405b, Doubao-1.5-pro, Qwen-max, DeepSeek-V3
- **Community Detection**: Leiden algorithm
- **Visual**: Faster R-CNN + ResNet18

### Các trích dẫn chính để theo dõi
- **GraphRAG** (Edge et al. 2024): Nguồn cảm hứng cho truy hồi đa tỉ lệ
- **Chakraborty (2024)**: Suy luận đồ thị của LLM (mâu thuẫn với khẳng định cốt lõi)
- **SocialGPT** (Li et al. 2024): Baseline LLM cho quan hệ xã hội
- **Leiden algorithm** (Traag et al. 2019): Phát hiện cộng đồng
- **Modularity** (Newman & Girvan 2004): Thước đo chất lượng cộng đồng

---

**Hoàn thành phân tích**: 2026-01-29
**Paper ID**: 2025.emnlp-main.224
**Analyzer**: Ralph Reader (Scientific Paper Analysis Agent)
**Phương pháp phân tích**: Đọc phê bình tập trung vào câu hỏi nghiên cứu, độ chặt chẽ phương pháp, đe dọa hợp lệ, khả năng tái lập, và đánh giá đóng góp

**Hạn chế của phân tích này**:
1. Chỉ dựa trên Section 1 (Introduction + Related Work + Preliminaries) — ~15-20% bài
2. Kết quả thực nghiệm (Section 5) chưa phân tích — không thể kiểm chứng các khẳng định về hiệu năng
3. Phương pháp chi tiết (Section 4) chưa phân tích — thiếu chi tiết triển khai
4. Discussion (Section 6) chưa phân tích — có thể xử lý một số lo ngại đã nêu
5. Prompt ở Appendix D chưa được xem — rất quan trọng cho đánh giá tái lập

**Khuyến nghị**: Nên cập nhật phân tích này khi có quyền truy cập bài đầy đủ, đặc biệt Sections 4-6.
