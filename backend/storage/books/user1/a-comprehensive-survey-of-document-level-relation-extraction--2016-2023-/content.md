# A Comprehensive Survey of Document-level Relation Extraction (2016-2023) - Phân tích phản biện đầy đủ

## Thông tin bài báo

- **Tiêu đề**: A Comprehensive Survey of Document-level Relation Extraction (2016-2023)
- **Tác giả**: Julien Delaunay, Hanh Thi Hong Tran, Carlos-Emiliano González-Gallardo, Georgeta Bordea, Nicolas Sidere, Antoine Doucet (Univ. La Rochelle, L3i, France)
- **Công bố**: ACM (nộp tháng 10/2023)
- **DOI**: 10.1145/nnnnnnn.nnnnnnn (pending)
- **Trích dẫn**: N/A (quá mới)
- **Lĩnh vực nghiên cứu**: Natural Language Processing, Information Extraction, Document-level Relation Extraction
- **Loại tài liệu**: Survey/Literature Review (KHÔNG phải nghiên cứu thực nghiệm)

---

## TL;DR

Khảo sát tổng quan này hệ thống hóa 80+ phương pháp và 10+ bộ dữ liệu cho trích xuất quan hệ ở mức tài liệu (DocRE) giai đoạn 2016-2023, theo dõi sự tiến hóa từ các cách tiếp cận dựa trên chuỗi sang dựa trên đồ thị rồi dựa trên transformer. **Kết luận chính**: Các mô hình đồ thị (68.72% F1) vượt các mô hình transformer (65.87% F1) trên benchmark DocRED, nhưng có **khiếm khuyết nghiêm trọng**: không có kiểm định ý nghĩa thống kê, không có đo lường chi phí tính toán, và không có mốc chuẩn hiệu năng của con người.

---

## Câu hỏi nghiên cứu & giả thuyết

| RQ | Câu hỏi | Kết quả | Chất lượng |
|----|--------|---------|------------|
| **SRQ1** | Những nguồn lực (bộ dữ liệu) nào tồn tại cho DocRE? | ✓ **Đã trả lời**: 10+ bộ dữ liệu được liệt kê (Bảng 1-2) | ⭐⭐⭐⭐☆ |
| **SRQ2** | Những hướng tiếp cận nào tồn tại cho DocRE? | ✓ **Đã trả lời**: 80+ phương pháp, xây dựng phân loại (Hình 4) | ⭐⭐⭐⭐☆ |
| **SRQ3** | Các phương pháp so sánh với nhau về hiệu năng như thế nào? | ⚠️ **Một phần**: Có Bảng 3-6, nhưng **không có kiểm định thống kê** | ⭐⭐☆☆☆ |
| **SRQ4** | Các hạn chế & hướng nghiên cứu tương lai là gì? | ✓ **Đã trả lời**: Thảo luận ở Mục 8 | ⭐⭐⭐⭐☆ |

**Đánh giá tổng thể chất lượng RQ**: ⭐⭐⭐⭐☆ - Các RQ phù hợp với tổng quan tài liệu, nhưng SRQ3 được xử lý chưa thỏa đáng (không có thống kê suy luận).

---

## Khung lý thuyết

### Nền tảng

**DocRE như phần mở rộng của trích xuất quan hệ mức câu (Sentence-level RE)**:
- **Mức câu**: 2 thực thể, mỗi thực thể 1 lần nhắc, quan hệ tuyến tính
- **Mức tài liệu**: 10-30+ thực thể, nhiều lần nhắc (đồng tham chiếu), quan hệ bậc hai n(n-1)

**Ký hiệu hình thức** (Zhang et al. 2020):
```
Document: D = {S_i}_{i=1}^{n_s} (n_s sentences)
Entity Set: V = {E_i}_{i=1}^{n_e} (n_e entities)
Entity: E_i = {m_j}_{j=1}^{n_i^m} (multiple mentions)
Goal: Predict R' ⊆ R (all inter/intra-sentence relations)
```

### Đóng góp mới

**Các tiến triển khái niệm được ghi nhận**:
1. **Biểu diễn lấy thực thể làm trung tâm** (Jia 2019): avg → max → **logsumexp** (gộp mềm)
2. **Ngưỡng thích nghi** (ATLOP 2020): Ngưỡng theo từng cặp cho phân loại đa nhãn
3. **Gộp ngữ cảnh cục bộ** (ATLOP 2020): Embedding thực thể khác nhau tùy đối tác
4. **Phân đoạn ngữ nghĩa cho DocRE** (DocuNet 2021): Kỹ thuật thị giác máy tính → NLP

**Cơ sở lý thuyết**: ⭐⭐⭐⭐☆
- Hình thức hóa vững (Zhang et al. 2020)
- Thể hiện rõ tiến trình các mô hình kiến trúc
- Liên hệ với lý thuyết bộ nhớ làm việc (Barreyro 2012, Cowan 2001) cho giới hạn bằng chứng 3 câu

---

## Tổng quan phương pháp

### Đánh giá phương pháp khảo sát

| Khía cạnh | Thông lệ chuẩn | Khảo sát này | Khoảng trống | Mức độ |
|----------|----------------|--------------|--------------|--------|
| **Giao thức tìm kiếm** | PRISMA, Cochrane | Phi chính thức (Google Scholar, ACL) | Cao | 🟡 |
| **Tiêu chí chọn lọc** | Khung PICO rõ ràng | "Liên quan đến DocRE" | **Nghiêm trọng** | 🔴 |
| **Đánh giá chất lượng** | Công cụ đánh giá thiên lệch | ❌ Không thực hiện | **Nghiêm trọng** | 🔴 |
| **Độ tin cậy giữa người đánh giá** | Cohen's κ, Krippendorff's α | ❌ Không báo cáo | Cao | 🟡 |
| **Trích xuất dữ liệu** | Biểu mẫu định sẵn | ❌ Ngầm định | Vừa | 🟡 |
| **Tổng hợp** | Meta-analysis (nếu khả thi) | Tường thuật + bảng | Vừa | 🟡 |
| **Thiên lệch công bố** | Biểu đồ phễu, kiểm định Egger | ❌ Không đánh giá | Vừa | 🟡 |

**Độ chặt chẽ phương pháp tổng thể**: ⭐⭐☆☆☆ (2/5)

**Kết luận**: **Tổng quan tường thuật toàn diện, KHÔNG phải systematic review** theo chuẩn y khoa/lâm sàng.

**Tác động**:
- ✓ Bao quát bề rộng lĩnh vực
- ✗ Có thể có thiên lệch chọn lọc (tính chủ quan của "liên quan")
- ✗ Không thể định lượng dị biệt (heterogeneity)
- ✗ Khả năng tái lập hạn chế (không có sơ đồ PRISMA)

---

## Tóm tắt các phát hiện chính

### Phát hiện chính 1: Bức tranh bộ dữ liệu

**Phát hiện**: Thiếu các bộ dữ liệu gán nhãn vàng (gold) quy mô lớn; chuẩn đánh giá bị “độc canh” quanh DocRED.

| Miền | Bộ dữ liệu gold | Lớn nhất (N tài liệu) | Vấn đề |
|------|------------------|------------------------|--------|
| **Tổng quát** | 3 (DocRED, Re-DocRED, DWIE) | DocRED (5,053) | Thiên lệch gán nhãn, âm tính giả |
| **Y sinh** | 2 (BC5CDR, BioRED) | BC5CDR (1,500) | Quy mô nhỏ, chuyên biệt |
| **Silver** | Nhiều (GDA, DocRED-distant) | DocRED-distant (101,873) | Nhiễu (distant supervision) |

**Mức độ bằng chứng**: ⭐⭐⭐⭐☆ (Được trình bày tốt ở Bảng 1-2)

**Vấn đề then chốt**:
1. **Thiên lệch DocRED** (Huang 2022, Tan 2022b):
   - Gán nhãn kiểu recommend-revise → âm tính giả có tính hệ thống
   - Thiếu tri thức KB → thiếu quan hệ
   - Re-DocRED bổ sung +81% quan hệ (12.5 → 28.1 trung bình)
2. **Độc canh benchmark**: 40+ phương pháp trên DocRED so với **2 phương pháp trên DWIE**

**Độ vững**: ✓ Được xác thực bởi các nghiên cứu tái gán nhãn độc lập (Re-DocRED)

---

### Phát hiện chính 2: Đồ thị > Transformer (ĐƯỢC TUYÊN BỐ)

**Tuyên bố**: "Graph-based methods [...] are more performant than transformer-based ones" (p.25)

**Bằng chứng** (DocRED, BERT-base):
- **Đồ thị tốt nhất**: EGCN-BERT (68.72 F1, 65.95 IgnF1) [Sun et al. 2022b]
- **Transformer tốt nhất**: DREEAM (65.87 F1, 63.73 IgnF1) [Ma et al. 2023]
- **Chênh lệch**: 2.85 điểm F1

**Hỗ trợ thống kê**: ❌ **BẰNG KHÔNG**
- Không có kiểm định ý nghĩa (t-test, McNemar's, Wilcoxon)
- Không có khoảng tin cậy (bootstrap, phân tích)
- Không có error bars
- Khác nhau về random seeds, siêu tham số → không thể loại trừ biến thiên do lấy mẫu

**Mức độ bằng chứng**: ⭐⭐☆☆☆ (Yếu - chỉ mang tính mô tả)

**Các giải thích thay thế**:
1. **Biến thiên do lấy mẫu**: 2.85% có thể nằm trong nhiễu
2. **Tối ưu siêu tham số**: Mô hình đồ thị có thể được tối ưu nhiều hơn
3. **Overfitting benchmark**: EGCN được thiết kế riêng cho DocRED
4. **Nhiễu do yếu tố nhiễu (confounds)**: Khác biến thể BERT, khác train/dev splits

**Tái lập (replication)**: ✗ **Không được thử** (không có kiểm chứng liên bộ dữ liệu trên DWIE, BioRED)

---

### Phát hiện chính 3: Chi phí tính toán (ĐƯỢC TUYÊN BỐ)

**Tuyên bố**: "Graph-based methods [...] come with substantial computational overhead" (p.25)

**Bằng chứng**: ❌ **Không có dữ liệu định lượng**
- Không có đo thời gian chạy (wall-clock, GPU hours)
- Không có sử dụng bộ nhớ (RAM, VRAM)
- Không có phân tích FLOPs
- Không có throughput (docs/sec)
- Không có tiêu thụ năng lượng

**Mức độ bằng chứng**: ⭐☆☆☆☆ (Không có)

**Kết luận**: 🚩 **CỜ ĐỎ** - Nhận định hoàn toàn không được chứng minh

**Tác động**: **Lỗi nghiêm trọng** - người thực hành không thể ra quyết định chi phí–lợi ích

**Điều cần có**:
- Biên Pareto hiệu năng–chi phí có thực nghiệm
- Thời gian chạy trên phần cứng chuẩn (V100, A100)
- Chi phí trên mỗi 1000 tài liệu
- Ablation: Cấu trúc đồ thị mang lại đủ giá trị để bù chi phí hay không?

---

### Phát hiện chính 4: Suy luận đa câu

**Tuyên bố**: "40.7% of DocRED relations require multi-sentence reasoning" (p.8, Yao 2019)

**Bằng chứng**:
- **Nhận dạng mẫu** (trong câu): 38.9%
- **Suy luận đa câu**: 40.7%
  - Logic (thực thể cầu nối): 26.6%
  - Đồng tham chiếu: 17.6%
  - Tri thức thường thức: 16.6%

**Bằng chứng hỗ trợ** (Huang 2021):
- 96.1% quan hệ: ≤3 câu
- 87.7% quan hệ: ≤2 câu

**Cơ sở lý thuyết**: Hạn chế bộ nhớ làm việc (Barreyro 2012), giới hạn 3-4 “mảnh” (Cowan 2001)

**Mức độ bằng chứng**: ⭐⭐⭐☆☆ (Vừa)

**Hạn chế**:
- **Chỉ một bộ dữ liệu**: chỉ DocRED (đoạn Wikipedia)
- **Gán nhãn chủ quan**: phân loại kiểu suy luận thủ công
- **Chưa được xác thực**: không có tái lập trên DWIE, BioRED, hay miền khác

**Khả năng khái quát**: Chưa rõ 40.7% có đúng với bài báo khoa học, văn bản pháp lý, mạng xã hội hay không

---

### Phát hiện chính 5: Trần hiệu năng

**Phát hiện**: SOTA hiện tại (EGCN-BERT): 68.72% F1 trên DocRED

**Tiến bộ**: +15% F1 từ 2016-2023
- Baseline 2019 (Bi-LSTM): 51.06 F1
- 2020 GAIN (+10%): 61.24 F1
- 2020 ATLOP: 61.30 F1
- 2022 EGCN (+6%): 68.72 F1
- 2023 DREEAM: 65.87 F1

**Mức độ bằng chứng**: ⭐⭐⭐⭐☆ (Tiến trình được trình bày rõ)

**Khoảng trống nghiêm trọng**: ❌ **Không có mốc hiệu năng của con người**
- F1 của con người trên DocRED là bao nhiêu?
- Mức nhất quán giữa người gán nhãn (Cohen's κ) là bao nhiêu?
- 68% gần trần hay vẫn còn nhiều dư địa?

**Bối cảnh so sánh**:
- RE mức câu: ~90% F1 (TAC-RED)
- NER: ~95% F1 (CoNLL-2003)
- DocRE: 68.72% F1 (**kém 20-25%**)

**Hàm ý**: Bài toán hoặc rất khó, hoặc mô hình còn xa tối ưu

---

## Điểm mạnh

### Điểm mạnh về phương pháp

1. **Hệ thống hóa toàn diện**: 80+ phương pháp, 10+ bộ dữ liệu - nhiều khả năng bao phủ đầy đủ 2016-2023
2. **Phân loại rõ ràng**: Sequence → Graph → Transformer → Semantic Segmentation (Hình 4)
3. **Phân tích theo thời gian**: Theo dõi tiến hóa tốt (Hình 2 cho thấy tăng trưởng theo hàm mũ)
4. **Liên kết mã nguồn**: URL GitHub cho phần lớn phương pháp → hỗ trợ tái lập
5. **Bảng so sánh**: Tra cứu thuận tiện (Bảng 3-6)

### Điểm mạnh về lý thuyết

1. **Phân tích bộ dữ liệu có tính phản biện**: Chỉ ra thiên lệch DocRED (recommend-revise, thiếu KB)
2. **Khuyến nghị đa dạng hóa**: Thúc đẩy dùng DWIE, BioRED, Re-DocRED
3. **Theo dõi tiến hóa khái niệm**: Biểu diễn thực thể (avg → max → logsumexp)
4. **Hình thức hóa bài toán**: Ký hiệu rõ ràng (Zhang et al. 2020)
5. **Liên hệ khoa học nhận thức**: Lý thuyết bộ nhớ làm việc cho giới hạn 3 câu

### Điểm mạnh thực tiễn

1. **Gắn với ứng dụng**: Xây dựng KB, y sinh IE
2. **Khuyến nghị benchmark**: Hướng dẫn rõ (dùng Re-DocRED, không chỉ DocRED)
3. **Hướng tương lai**: LLMs, semantic segmentation

---

## Hạn chế & đe dọa tính hợp lệ

### Hạn chế nghiêm trọng (🔴)

1. **Không có kiểm định ý nghĩa thống kê**
   - **Tác động**: Không thể kết luận Đồ thị > Transformer
   - **Mức độ**: 🔴 Nghiêm trọng
   - **Khắc phục**: Chạy McNemar's test, bootstrap CI

2. **Không có dữ liệu chi phí tính toán**
   - **Tác động**: Cụm "substantial overhead" hoàn toàn không có cơ sở
   - **Mức độ**: 🔴 Nghiêm trọng
   - **Khắc phục**: Đo runtime, memory, FLOPs

3. **Không có mốc hiệu năng của con người**
   - **Tác động**: Không thể đánh giá 68% F1 gần trần hay còn dư địa
   - **Mức độ**: 🔴 Nghiêm trọng
   - **Khắc phục**: Nghiên cứu IAA trên DocRED (Cohen's κ)

4. **Không có giao thức systematic review**
   - **Tác động**: Thiên lệch chọn lọc, khó tái lập
   - **Mức độ**: 🔴 Nghiêm trọng
   - **Khắc phục**: Tuân thủ PRISMA

5. **Độc canh benchmark**
   - **Tác động**: Overfitting DocRED đe dọa khả năng khái quát
   - **Mức độ**: 🔴 Nghiêm trọng
   - **Khắc phục**: Bắt buộc đánh giá đa bộ dữ liệu

### Hạn chế vừa (🟡)

6. **Thiên lệch ngôn ngữ**: Chỉ tiếng Anh (thừa nhận p.28 nhưng không xử lý)
7. **Bỏ qua dị biệt**: Khác seeds, splits, siêu tham số giữa các bài
8. **F1 là thước đo duy nhất**: Mất cân bằng lớp (quan hệ N/A trội) có thể gây hiểu sai
9. **Thiên lệch miền**: Chỉ tổng quát + y sinh (không có pháp lý, tài chính, mạng xã hội)
10. **Thiên lệch công bố**: Chỉ bài đã công bố (không có grey literature, không có funnel plots)
11. **Độ tin cậy giữa người đánh giá**: Chọn bài mang tính chủ quan (không có Cohen's κ)

### Hạn chế nhỏ (🟢)

12. **Suy đoán về LLM**: Khảo sát dừng ở 2023 (đầu thời kỳ GPT-4) - các nhận định có thể đã lạc hậu
13. **DWIE ít được dùng**: Chỉ 2 phương pháp dùng lựa chọn gold thay thế (thiên lệch theo độ mới?)

### Đánh giá tính hợp lệ

| Loại hợp lệ | Đánh giá | Đe dọa chính |
|------------|----------|--------------|
| **Nội tại (Internal)** | ⭐⭐⭐☆☆ | Thiên lệch chọn lọc, thiên lệch công bố |
| **Ngoại suy (External)** | ⭐⭐☆☆☆ | Thiên lệch ngôn ngữ, độc canh benchmark, thiên lệch miền |
| **Kết luận thống kê** | ⭐☆☆☆☆ | Không kiểm định ý nghĩa, không CI, bỏ qua dị biệt |
| **Khái niệm (Construct)** | ⭐⭐⭐☆☆ | Chỉ dùng F1, "overhead" không đo lường |

**Tính hợp lệ tổng thể**: ⭐⭐☆☆☆

---

## Đánh giá phản biện

### Điều khảo sát làm rất tốt

1. ✓ **Hệ thống hóa toàn diện**: Bao quát bề rộng lĩnh vực (80+ phương pháp)
2. ✓ **Phân tích bộ dữ liệu có tính phản biện**: Nêu thiên lệch DocRED, khuyến nghị lựa chọn thay thế
3. ✓ **Phân loại rõ ràng**: Tiến trình Sequence → Graph → Transformer
4. ✓ **Góc nhìn theo thời gian**: Tiến hóa 2016-2023 được theo dõi tốt
5. ✓ **Tính hữu dụng thực tiễn**: Link GitHub, bảng so sánh, gắn ứng dụng

### Những điểm có thể cải thiện mạnh

#### Lỗi nghiêm trọng

1. ✗ **Không có kiểm định ý nghĩa thống kê**
   - **Vấn đề**: Kết luận "Graph > Transformer" dựa trên chênh 2.85 F1 mà không có p-values
   - **Tác động**: Có thể dẫn dắt cộng đồng theo/hay tránh một kiến trúc vì kết luận chưa đủ cơ sở
   - **Khắc phục**: Chạy McNemar's test, bootstrap 95% CI

2. ✗ **Không có đo lường chi phí tính toán**
   - **Vấn đề**: Nhận định "Substantial overhead" không có bất kỳ dữ liệu nào
   - **Tác động**: Người thực hành không thể ra quyết định chi phí–lợi ích
   - **Khắc phục**: Đo runtime (GPU hours), memory (VRAM), throughput (docs/sec)

3. ✗ **Không có mốc hiệu năng của con người**
   - **Vấn đề**: Không biết 68% F1 gần trần hay vẫn còn dư địa
   - **Tác động**: Không rõ bài toán đang bão hòa hay không
   - **Khắc phục**: Nghiên cứu IAA (Cohen's κ, Krippendorff's α)

4. ✗ **Không có giao thức systematic review**
   - **Vấn đề**: Thiên lệch chọn lọc, tái lập hạn chế
   - **Tác động**: Không thể độc lập kiểm chứng quyết định chọn bài
   - **Khắc phục**: Tuân thủ PRISMA, công bố tiêu chí chọn lọc

#### Lỗi vừa

5. ⚠️ **Độc canh benchmark**
   - **Vấn đề**: 40+ phương pháp trên DocRED so với 2 trên DWIE
   - **Tác động**: Overfitting vào đoạn Wikipedia
   - **Khắc phục**: Bắt buộc đánh giá đa bộ dữ liệu (DocRED + DWIE + BioRED + Re-DocRED)

6. ⚠️ **Thiên lệch ngôn ngữ**
   - **Vấn đề**: Chỉ tiếng Anh (thừa nhận nhưng không xử lý)
   - **Tác động**: Không khái quát cho DocRE đa ngôn ngữ
   - **Khắc phục**: Khảo sát các công trình không tiếng Anh (Chinese, Arabic, multilingual datasets)

### Các giải thích thay thế cho phát hiện chính

**Về "Graph > Transformer"**:
1. **Biến thiên do lấy mẫu**: Chênh 2.85 F1 có thể nằm trong nhiễu (cần bootstrap CI)
2. **Tối ưu siêu tham số**: Mô hình đồ thị có thể được đầu tư hơn (thiên lệch công bố)
3. **Overfitting benchmark**: EGCN thiết kế riêng cho DocRED
4. **Yếu tố nhiễu**: Khác biến thể BERT, khác random seeds

**Về "40.7% suy luận đa câu"**:
1. **Tính chủ quan của gán nhãn**: Phân loại kiểu suy luận thủ công
2. **Đặc thù bộ dữ liệu**: Có thể không khái quát ngoài DocRED (đoạn Wikipedia)
3. **Danh mục chồng lấn**: Tổng > 100% gợi ý các danh mục không loại trừ nhau

### Câu hỏi chưa được trả lời

**Nghiêm trọng**:
1. F1 của con người trên DocRED là bao nhiêu? (cận trên cho hiệu năng mô hình)
2. Inter-annotator agreement (Cohen's κ) là bao nhiêu?
3. Mô hình đồ thị có thực sự đắt hơn không? (cần runtime, memory, FLOPs)
4. Chênh 2.85 F1 có ý nghĩa thống kê không? (cần p-values, CI)

**Vừa**:
5. Ưu thế đồ thị có khái quát qua các bộ dữ liệu không? (DWIE, BioRED, Re-DocRED)
6. Vì sao DWIE ít được dùng? (Chỉ 2 phương pháp dù có gold annotation)
7. Biên Pareto chi phí–hiệu năng là gì? (hiệu quả vs độ chính xác)

**Thăm dò**:
8. LLMs (GPT-4, LLaMA-3, Claude-3.5) có thay thế mô hình DocRE chuyên biệt không?
9. Semantic segmentation có thể được khai thác thêm không? (chỉ 2 bài, kết quả hứa hẹn)
10. DocRE đa phương thức thì sao? (tài liệu + hình ảnh/bảng)

---

## Đánh giá khả năng tái lập

### Checklist

- [x] Mô tả chiến lược tìm kiếm (Google Scholar, Elsevier, ACL Anthology)
- [ ] ❌ Tiêu chí đưa vào/loại trừ rõ ràng (chỉ nói "relevant to DocRE")
- [ ] ❌ Sơ đồ PRISMA
- [ ] ❌ Chia sẻ biểu mẫu trích xuất dữ liệu
- [ ] ❌ Thực hiện đánh giá chất lượng (không có risk-of-bias tool)
- [ ] ❌ Báo cáo độ đồng thuận giữa người đánh giá (không có Cohen's κ)
- [ ] ❌ Đánh giá risk-of-bias
- [ ] ❌ Đánh giá thiên lệch công bố (không có funnel plots)
- [x] Có bảng so sánh (Bảng 3-6)
- [ ] ❌ Meta-analysis (không thực hiện)
- [x] Có link mã nguồn (URL GitHub cho hầu hết phương pháp)

**Điểm tái lập**: ⭐⭐☆☆☆ (2/5) - Thấp–Trung bình

**Khả năng replication**: Trung bình
- Có thể tìm lại cơ sở dữ liệu với cùng thuật ngữ
- Nhưng **không thể độc lập kiểm chứng quyết định chọn bài** (tính chủ quan của "relevance")

---

## Đóng góp cho lĩnh vực

### Đóng góp lý thuyết

- ⭐⭐⭐⭐☆ **Nâng cao hiểu biết**: Phân loại rõ, theo dõi tiến hóa khái niệm
- ⭐⭐⭐☆☆ **Giải quyết tranh luận**: Một phần (chỉ ra thiên lệch DocRED, nhưng không phân định Graph vs Transformer)

### Đóng góp phương pháp

- ⭐⭐⭐☆☆ **Phương pháp khảo sát**: Toàn diện nhưng không mang tính hệ thống (không tuân PRISMA)
- ⭐⭐⭐⭐☆ **Danh mục nguồn lực**: Tài liệu tham chiếu quan trọng cho bộ dữ liệu, phương pháp, link mã nguồn

### Đóng góp thực nghiệm

- ⭐⭐☆☆☆ **Phân tích so sánh**: Bảng hữu ích, nhưng thiếu chặt chẽ thống kê (không có kiểm định ý nghĩa)
- ⭐⭐⭐⭐☆ **Theo dõi theo thời gian**: Tiến hóa 2016-2023 được ghi nhận tốt

### Hàm ý thực tiễn

**Với nhà nghiên cứu**:
- ✓ Điểm khởi đầu thiết yếu cho DocRE
- ✓ Phân loại rõ giúp định hướng phát triển phương pháp
- ⚠️ Thận trọng với kết luận "Graph > Transformer" (không được xác thực thống kê)

**Với người thực hành**:
- ✓ Biết nên dùng bộ dữ liệu nào (DocRED, Re-DocRED, DWIE, BioRED)
- ✗ Không thể ra quyết định chi phí–lợi ích (không có dữ liệu runtime)
- ⚠️ Tự kiểm chứng nhận định về chi phí tính toán trước khi triển khai

**Tác động tổng thể**: 🔥🔥🔥🔥☆ (Tác động cao)
- Có khả năng được trích dẫn nhiều (toàn diện, kịp thời, tổ chức tốt)
- Nhưng **không mang tính kết luận cuối cùng** vì thiếu chặt chẽ thống kê

---

## Vị trí trong văn liệu

### Kế thừa từ

- **Các khảo sát RE trước đây**:
  - Bach & Badaskar 2007 (phương pháp giám sát mức câu)
  - Pawar et al. 2017 (mức câu, CNN giai đoạn sớm)
  - Bassignana & Plank 2022 (RE cho văn bản khoa học, chỉ nhắc DocRE ngắn)
- **Khoảng trống được lấp**: Khảo sát toàn diện đầu tiên tập trung riêng cho DocRE

### Được trích dẫn bởi (tiềm năng - quá mới)

- Nhiều khả năng trở thành **tài liệu tham chiếu chuẩn** cho DocRE (toàn diện, kịp thời)
- Có thể tác động đến sự đa dạng benchmark (khuyến nghị DWIE, BioRED, Re-DocRED)

### Mâu thuẫn với

- **Mâu thuẫn ngầm**: Các khảo sát mức câu trước giả định pattern matching là đủ
  - Khảo sát này: 40.7% quan hệ DocRED cần suy luận đa câu

---

## Hướng nghiên cứu tương lai

### Do tác giả gợi ý

1. **LLMs cho DocRE**: thời kỳ GPT-4, LLaMA-2 (khảo sát viết 2023)
2. **Semantic segmentation nâng cao**: Kỹ thuật thị giác máy tính → NLP
3. **Cải thiện hiệu quả**: Mô hình đồ thị nặng tính toán (được tuyên bố)
4. **Kết hợp NER+RE**: Multi-task learning
5. **Vượt ra ngoài named entities**: Terms, concepts (không chỉ persons, orgs, locations)

### Các bước tiếp theo then chốt (đánh giá của tôi)

#### Ngắn hạn (lấp khoảng trống nghiêm trọng)

1. **Nghiên cứu hiệu năng con người**: Chạy IAA trên DocRED (Cohen's κ, Krippendorff's α)
   - **Vì sao**: Thiết lập cận trên cho hiệu năng mô hình
   - **Tác động**: Cao - đánh giá bài toán có bão hòa hay không

2. **Kiểm định ý nghĩa thống kê**: Bootstrap CI cho mọi so sánh mô hình
   - **Vì sao**: Không thể kết luận Graph > Transformer nếu không có p-values
   - **Tác động**: Cao - xác thực/bác bỏ tuyên bố cốt lõi

3. **Nghiên cứu chi phí tính toán**: Runtime, memory, FLOPs cho Graph vs Transformer
   - **Vì sao**: Nhận định "substantial overhead" hiện không có bằng chứng
   - **Tác động**: Cao - cho phép phân tích chi phí–lợi ích

4. **Kiểm chứng liên bộ dữ liệu**: Đánh giá các phương pháp tốt nhất trên DWIE, BioRED, Re-DocRED
   - **Vì sao**: Độc canh benchmark đe dọa khả năng khái quát
   - **Tác động**: Cao - kiểm tra độ vững

#### Trung hạn (mở rộng phạm vi)

5. **DocRE đa ngôn ngữ**: Khảo sát công trình không tiếng Anh (Chinese, Arabic)
   - **Vì sao**: Khảo sát hiện chỉ tiếng Anh
   - **Tác động**: Trung bình - mở rộng khả năng áp dụng

6. **Mở rộng miền**: Pháp lý, tài chính, mạng xã hội
   - **Vì sao**: Khảo sát hiện chỉ tổng quát + y sinh
   - **Tác động**: Trung bình - bao phủ thực tế

7. **Benchmark LLM**: GPT-4, Claude-3.5, LLaMA-3 trên DocRED
   - **Vì sao**: Khảo sát 2023 có trước giai đoạn LLM bão hòa đầy đủ
   - **Tác động**: Cao - đánh giá liệu mô hình chuyên biệt còn cần thiết hay không

#### Dài hạn (tiến triển lý thuyết)

8. **DocRE đa phương thức**: Tài liệu + hình ảnh/bảng
   - **Vì sao**: Tài liệu thực tế thường đa phương thức
   - **Tác động**: Trung bình–Cao - hướng mới

9. **Phân tích lý thuyết**: PAC bounds, sample complexity cho DocRE
   - **Vì sao**: Hiện chưa có bảo đảm lý thuyết
   - **Tác động**: Trung bình - củng cố nền tảng

10. **Độ bền trước tấn công (adversarial robustness)**: Stress-test mô hình DocRE
    - **Vì sao**: Không được bàn trong khảo sát
    - **Tác động**: Trung bình - độ tin cậy

---

## Các điểm rút ra chính

### Dành cho nhà nghiên cứu NLP

1. **Chính**: DocRE là lĩnh vực sôi động (tăng trưởng theo hàm mũ 2016-2023), nhưng cần:
   - ✗ Chặt chẽ thống kê (kiểm định ý nghĩa)
   - ✗ Phân tích chi phí tính toán
   - ✗ Mốc chuẩn con người
2. **Lưu ý**: Kết luận "Graph > Transformer" **không được xác thực thống kê**
3. **Cơ hội**: Semantic segmentation còn ít được khai thác (chỉ 2 bài, kết quả hứa hẹn)
4. **Nguồn lực**: Dùng Re-DocRED, DWIE, BioRED (không chỉ DocRED)

### Dành cho người thực hành

1. **Bộ dữ liệu**: DocRED (5K tài liệu, tổng quát), Re-DocRED (tái gán nhãn, +81% quan hệ), BioRED (y sinh)
2. **Mô hình**: EGCN-BERT (68.72% F1, SOTA đồ thị), DREEAM (65.87% F1, SOTA transformer)
3. **Thận trọng**: Nhận định về chi phí tính toán chưa được kiểm chứng - cần đo trước khi triển khai
4. **Đánh đổi**: Mô hình đồ thị có thể chính xác hơn nhưng có thể tốn kém hơn (cần xác minh)

### Dành cho meta-researchers

1. **Ví dụ**: Khảo sát khoa học máy tính thường thiếu độ chặt chẽ như systematic review y khoa (PRISMA)
2. **Khoảng trống**: Kiểm định ý nghĩa thống kê chưa thành chuẩn trong văn liệu khảo sát NLP
3. **Cơ hội**: Phát triển hướng dẫn systematic review riêng cho NLP

---

## Ghi chú cá nhân

### Độ tin cậy: ⭐⭐⭐⭐☆ (4/5)

**Có tin các phát hiện?**:
- ✓ **Có** cho: Danh mục bộ dữ liệu, phân loại phương pháp, tiến hóa theo thời gian, theo dõi khái niệm
- ⚠️ **Có điều kiện** cho: So sánh Graph vs Transformer (không có kiểm định ý nghĩa)
- ✗ **Không** cho: Nhận định chi phí tính toán (không có bằng chứng)

**Có khuyến nghị trích dẫn?**:
- ✓ **Có** - Toàn diện, kịp thời, tổ chức tốt, có khả năng trở thành tài liệu tham chiếu chuẩn
- Nhưng nên **bổ sung**:
  - Kiểm định thống kê nếu so sánh mô hình
  - Nghiên cứu chi phí thực nghiệm nếu triển khai

**Mức chất lượng**: **Tổng quan tường thuật hạng cao** (nhưng KHÔNG phải systematic review theo chuẩn y khoa)

### Mức độ liên quan đến nghiên cứu DocRE

**Nên đọc bắt buộc đối với**:
- Người mới vào DocRE (giới thiệu toàn diện)
- Người phát triển phương pháp (phân loại rõ, chỉ ra khoảng trống)
- Người tạo benchmark (khuyến nghị đa dạng hóa bộ dữ liệu)

**Dùng cho**:
- Tổng quan văn liệu (danh mục toàn diện)
- Định vị công trình (tác phẩm của tôi nằm ở đâu?)
- So sánh baseline (Bảng 3-6)

**Không nên dùng cho**:
- Kết luận thống kê về Graph vs Transformer (chưa được xác thực)
- Ước lượng chi phí tính toán (không đo)
- Cận trên hiệu năng con người (không báo cáo)

### Các bài nên đọc tiếp

**Nền tảng**:
1. Yao et al. 2019 - DocRED dataset (thiết lập benchmark)
2. Zhang et al. 2020 - DHG (hình thức hóa bài toán)
3. Zhou et al. 2020 - ATLOP (adaptive thresholding, localized pooling)

**SOTA**:
4. Sun et al. 2022b - EGCN (SOTA đồ thị hiện tại, 68.72% F1)
5. Ma et al. 2023 - DREEAM (SOTA transformer hiện tại, 65.87% F1)
6. Zhang et al. 2021 - DocuNet (semantic segmentation, ít được khai thác)

**Phân tích phản biện**:
7. Huang et al. 2022 - Revisit DocRED (phơi bày thiên lệch gán nhãn)
8. Tan et al. 2022b - Re-DocRED (tái gán nhãn, +81% quan hệ)

---

**Ngày phân tích**: 2026-01-29
**Người phân tích**: Ralph Reader Agent (Critical Reading Mode ⚠️)
**Loại bài**: Survey/Literature Review (KHÔNG phải nghiên cứu thực nghiệm)
**Kết luận tổng thể**: ⭐⭐⭐⭐☆ (4/5) - **Toàn diện và hữu ích, nhưng thiếu chặt chẽ thống kê. Tài liệu tham chiếu thiết yếu dù còn khiếm khuyết.**
