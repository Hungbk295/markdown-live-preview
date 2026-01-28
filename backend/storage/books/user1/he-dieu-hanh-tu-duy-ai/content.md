# Mình đã dành gần 1 năm qua để xây một “hệ điều hành cho tư duy” với AI

Claude Code chạy trên Obsidian vault của mình.

Nó không chỉ “tóm tắt” ghi chú.

Nó trích ra các khái niệm cốt lõi, nối chúng với những gì mình đã hiểu trước đó, rồi dựng lên một bản đồ sống của tư duy.

Tới mức bây giờ, mình gần như chỉ làm việc bên trong vault.

⸻

### Mình không còn “ghi chú” nữa

Mình chỉ vận hành một hệ thống… tự ghi chú.

Markdown files biết hết mọi thứ mình đã khám phá.

Được cấu trúc gọn gàng.

Và có một thứ cực kỳ quan trọng:

**tự động bơm đúng ngữ cảnh vào đúng lúc (situational context injection)** để AI làm in-context learning tốt hơn.

Mình dùng một vault index để giúp agent quyết định nên đọc note nào trước.

Cách này y hệt như Claude Code quyết định nên load skill nào.

Nếu nghĩ sâu hơn…

mỗi note về bản chất cũng là một skill.

Nó là một mẩu tri thức được curate kỹ.

Chỉ được “inject” khi nó relevant.

⸻

### Thứ sâu hơn: vault encode cách bạn nghĩ, không chỉ bạn nghĩ gì

Đa số người dùng vault như nơi lưu trữ.

Nhưng với mình, vault là một thứ khác:

Nó encode methodology.

Nó lưu cả “cách mình tiếp cận vấn đề”

chứ không chỉ “kết luận mình viết ra”.

Và khi methodology nằm trong hệ thống…

AI không chỉ đọc tri thức.

Nó bắt đầu học style tư duy của bạn.

⸻

### Knowledge = code?

Một ngày mình nhận ra:

Knowledge base và codebase giống nhau hơn mọi người tưởng.

Cả hai đều là:

• một đống folder chứa text files
• có relationships giữa chúng
• có conventions và patterns
• càng to càng cần “agents” để navigate và vận hành

Vibe coding đã thay đổi cách dev viết phần mềm:

AI lo phần implementation.
Con người lo direction.

Mình tin là đúng y chang như vậy sẽ xảy ra với knowledge work.

Bạn không còn “take notes”.
Bạn vận hành một hệ thống tự take notes.

⸻

### Vault là gì?

Vault chỉ là một folder markdown có links qua lại:

```text
my-vault/
├── 00_inbox/ # vùng capture: không friction
├── 01_thinking/ # tư duy & synthesis
│ └── notes/ # note nhỏ, độc lập
├── 02_reference/ # kiến thức bên ngoài
│ ├── tools/
│ ├── approaches/
│ └── sources/
├── 03_creating/ # thứ đang viết / đang làm
│ └── drafts/
├── 04_published/ # output hoàn thiện
├── 05_archive/ # đồ cũ
├── 06_system/ # templates + scripts
├── CLAUDE.md # dạy AI hệ thống của bạn
└── attachments/
```

Các file nối nhau bằng `[[wiki links]]`, tạo thành network ý tưởng.

Khi bạn viết:
> vì [[Quality is the hard part]] nên cần tập trung vào curation

link không còn là footnote.
Nó trở thành một phần của suy nghĩ.

Agent đọc được logic của bạn bằng cách follow links.

⸻

### Viết note sao cho AI hiểu thật sự

Đa số mọi người link như kiểu “tham khảo ở cuối bài”.

Nhưng cách đó làm cho ý tưởng bị tách rời.

Mình làm ngược lại: **weave links vào câu văn.**

Đừng viết:
> cái này liên quan tới quality, xem note quality

Hãy viết:
> vì [[Quality is the hard part]] nên chúng ta cần ưu tiên curation

Link trở thành một phần của mạch lập luận.
Và agent có thể lần theo reasoning của bạn.

⸻

### Note phải đứng một mình được

Một note tốt giống LEGO.

Nó phải:
• tự hiểu được nếu người khác click vào
• không cần mở thêm 5 note khác mới hiểu

Nếu một note bắt buộc phải dựa vào quá nhiều bối cảnh… **tách nó ra.**

Composability quan trọng hơn “đầy đủ”.

⸻

### AI không tự hiểu triết lý của bạn đâu

Một bài học mình học được theo cách đau:

AI có thể “disrespect” triết lý của bạn rất nhanh.

Nó sẽ:
• làm sai tone
• phá conventions
• đẻ thêm noise
• và làm vault thành nghĩa địa

Và lúc đó bạn mới nhận ra:

Bạn có rất nhiều “implicit knowledge” trong đầu.
Nhưng chưa từng viết nó ra.

Khi bạn phải dạy Claude cách bạn nghĩ… bạn mới thấy mình đang mang bao nhiêu quy tắc ngầm.

CLAUDE.md của mình bây giờ khoảng ~2000 dòng.
Và nó vẫn tiếp tục lớn lên.

Vì mỗi lần Claude làm sai… mình biến sai lầm đó thành rule.
Compounding.

⸻

### Mỗi vault cần một philosophy riêng

Nhiều guide ngoài kia đưa cho bạn “một hệ thống” và bắt follow.

Nhưng vault không phải template chung.
Vault giống codebase.

Bạn không dùng structure của một CLI tool cho một web app.

Mình chạy nhiều vault:
• một vault để “thinking” (AI + tri thức + tư duy)
• một vault để “work” (projects, clients, delivery)

Pattern giống nhau.
Nhưng rules khác nhau.

⸻

### Pattern cốt lõi (bất biến)

Dù vault nào cũng sẽ có 4 thứ:

1. Markdown + links (AI đọc được 100%)
2. CLAUDE.md (dạy agent hệ thống của bạn)
3. Structure để agent orient nhanh
4. Conventions được viết ra thành instruction

Còn “instruction là gì”… tùy purpose của vault.

⸻

### Thinking vault của mình ưu tiên Depth

Mình cảm được sự khác biệt ngay lập tức:

Vault sạch → tư duy sâu.
Vault nhiễu → tư duy mệt.

Một đoạn trong CLAUDE.md của mình như sau:

> Depth over breadth. Quality over speed. Tokens are free.
> This is not about efficiency. This is about excellence.
> When you pick a task, commit to understanding it completely.
> Leave behind work future agents can build on.

Nó nghe có vẻ hơi “khó tính”.
Nhưng đó là thứ giữ hệ thống sống.

⸻

### Claude tìm thứ trong vault bằng cách nào?

Claude không thể đọc hết hàng ngàn note mỗi session.

Nên mình thiết kế nhiều lớp “orientation”:

1. **SessionStart hook** → Claude thấy folder structure ngay lập tức
2. **Index note** → list note + mô tả 1 câu (scan nhanh)
3. **Topic pages / MOCs** → table of contents cho từng chủ đề

MOCs còn chứa “breadcrumbs” mà Claude để lại cho chính nó.

Mỗi lần Claude khám phá được đường đi hợp lý trong graph… nó ghi lại vào topic page.
Session sau chỉ cần đọc lại là agent nhớ.

Vault bắt đầu học cách nghĩ xuyên qua chính nó.

⸻

### Core principles của thinking vault

Đây là mấy rule mình thấy hiệu quả nhất:

1. **Composability**: Note phải link được mà vẫn tự hiểu.
2. **Đặt tên note như claim, không đặt như topic**: Thay vì “Thoughts on AI slop”, mình viết “Quality is the hard part”. Khi link vào câu, title trở thành một phần lập luận. Điều này ép cả mình và AI phải hiểu sâu hơn.
3. **Network quan trọng hơn từng note đơn lẻ**: Một note có nhiều inbound links giá trị hơn một note cô lập. Vì mỗi link tạo ra một đường đọc mới. Network chính là tri thức.

⸻

### Agent vận hành như thế nào?

Mỗi task đều bắt đầu bằng orientation:
• scan structure
• đọc index
• vào topic page
• follow links
• rồi mới làm việc

Không sửa gì khi chưa có context.

Khi agent tìm ra insight mới từ việc kết hợp 2 note… nó tạo một note mới để capture insight đó.

Mỗi capture mới sẽ trigger:
• search note liên quan
• add link có ngữ cảnh
• update index nếu cần

⸻

### Markdown là hệ thống. Obsidian chỉ là cửa sổ

Điểm mình thích nhất là:

Tất cả chỉ là plain text.

Bạn sở hữu 100%.

Obsidian biến mất cũng không sao.

Bất kỳ editor nào cũng mở được.

Bất kỳ AI nào cũng đọc được.

⸻

### Bắt đầu như thế nào?

1. Tạo vault với folder theo đúng mục đích bạn muốn
2. Viết CLAUDE.md dạy agent luật chơi
3. Bắt đầu capture, rồi để Claude tìm connections
4. Luôn review output và chỉnh chất lượng

Bạn không còn là người “ghi chú”.
Bạn trở thành người curate.

Vai trò chuyển từ writer → editor.
Từ creator → curator.

⸻

### TL;DR

• Vibe coding đổi cách ta viết software
• “Vibe note taking” sẽ đổi cách ta nghĩ
• Vault là markdown + links
• LLM không có memory → vault cho nó memory
• CLAUDE.md dạy agent hệ thống của bạn
• Mỗi vault cần philosophy riêng
• Agent vận hành, con người giữ judgment
