---
title: "吃透平衡二叉树判断：从暴力解到O(n)时间+O(1)空间的极致优化"
date: 2025-12-15
categories: [算法设计]
---

 在二叉树的算法题中，**判断一棵二叉树是否为平衡二叉树**是高频考点。这道题不仅考察对平衡二叉树定义的理解，更考验对遍历顺序、时间/空间复杂度优化的深层思考。本文将从暴力解法入手，一步步推导到最优解，带你彻底掌握解题思路。 
 
 ## 一、问题定义与核心条件 
 首先明确平衡二叉树的定义： 
 > 一棵空树 **或** 左右两个子树的高度差的绝对值不超过1，并且左右两个子树都是平衡二叉树。 
 
 拆解核心判断条件： 
 1. **局部条件**：任意节点的左、右子树高度差 ≤ 1； 
 2. **全局条件**：任意节点的左、右子树本身也是平衡二叉树； 
 3. **边界条件**：空树是平衡二叉树。 
 
 问题要求： 
 - 时间复杂度 O(n) 
 - 空间复杂度 O(1) 
 - 节点数 n ≤ 100，节点值范围 0 ≤ val ≤ 1000 
 
 ## 二、从暴力解开始：直观但低效 
 拿到问题，最直观的思路是**先计算高度，再判断平衡**。 
 
 ### 2.1 暴力解思路 
 1. 编写一个 `getHeight` 函数，计算任意节点的高度（节点到叶子节点的最长路径长度）； 
 2. 对根节点，判断其左右子树的高度差是否 ≤ 1； 
 3. 递归判断左子树和右子树是否为平衡二叉树； 
 4. 三个条件同时满足，则为平衡二叉树。 
 
 ### 2.2 暴力解代码（Java） 
 ```java 
 class TreeNode { 
     int val; 
     TreeNode left; 
     TreeNode right; 
     TreeNode(int x) { val = x; } 
 } 
 
 public class Solution { 
     // 计算节点高度 
     private int getHeight(TreeNode node) { 
         if (node == null) return 0; 
         return Math.max(getHeight(node.left), getHeight(node.right)) + 1; 
     } 
 
     // 暴力判断平衡二叉树 
     public boolean IsBalanced_Solution(TreeNode pRoot) { 
         if (pRoot == null) return true; 
         // 局部条件：当前节点左右子树高度差 ≤1 
         boolean curBalanced = Math.abs(getHeight(pRoot.left) - getHeight(pRoot.right)) <= 1; 
         // 全局条件：左右子树均平衡 
         boolean leftBalanced = IsBalanced_Solution(pRoot.left); 
         boolean rightBalanced = IsBalanced_Solution(pRoot.right); 
         return curBalanced && leftBalanced && rightBalanced; 
     } 
 } 
 ``` 
 
 ### 2.3 暴力解的问题：时间复杂度 O(n²) 
 暴力解的核心缺陷是 **高度计算被重复执行**。 
 
 以一棵满二叉树为例： 
 - 根节点计算高度时，需要遍历所有节点； 
 - 左子树的根节点计算高度时，又要遍历左子树的所有节点； 
 - 越底层的节点，被计算高度的次数越多。 
 
 对于n个节点的二叉树，时间复杂度达到 O(n²)，当n较大时会严重超时。 
 
 ## 三、第一次优化：后序遍历+剪枝，时间复杂度降到O(n) 
 暴力解的问题在于**高度计算和平衡判断分离**，导致重复遍历。我们需要将两个操作合并，在一次遍历中同时完成高度计算和平衡判断——这就是**后序遍历**的核心优势。 
 
 ### 3.1 为什么选择后序遍历？ 
 二叉树节点的高度满足 **递归定义**：`当前节点高度 = max(左子树高度, 右子树高度) + 1`。 
 这意味着：**必须先知道左右子树的高度，才能计算当前节点的高度**。 
 
 后序遍历的顺序是 **左 → 右 → 根**，恰好满足这个需求： 
 - 遍历完左右子树后，已经获取了子树的高度和平衡状态； 
 - 处理当前节点时，直接复用子树的结果，无需重复计算。 
 
 ### 3.2 优化思路：用返回值传递高度和平衡状态 
 我们可以修改 `getHeight` 函数，让它同时承担两个职责： 
 - 若子树平衡，返回子树的高度； 
 - 若子树不平衡，返回一个特殊值（如-1），直接“剪枝”，避免后续无效计算。 
 
 ### 3.3 递归优化版代码（Java） 
 ```java 
 public class Solution { 
     public boolean IsBalanced_Solution(TreeNode pRoot) { 
         return getHeightAndCheck(pRoot) != -1; 
     } 
 
     // 计算高度的同时判断平衡：平衡返回高度，不平衡返回-1 
     private int getHeightAndCheck(TreeNode node) { 
         if (node == null) return 0; // 空节点高度为0，平衡 
         
         // 先处理左子树 
         int leftH = getHeightAndCheck(node.left); 
         if (leftH == -1) return -1; // 左子树不平衡，直接剪枝 
         
         // 再处理右子树 
         int rightH = getHeightAndCheck(node.right); 
         if (rightH == -1) return -1; // 右子树不平衡，直接剪枝 
         
         // 判断当前节点是否平衡 
         if (Math.abs(leftH - rightH) > 1) return -1; 
         
         // 平衡则返回当前节点高度 
         return Math.max(leftH, rightH) + 1; 
     } 
 } 
 ``` 
 
 ### 3.4 优化效果：时间复杂度 O(n) 
 每个节点只被遍历一次（左→右→根），高度计算和平衡判断一次完成，时间复杂度降到 O(n)。 
 
 ### 3.5 新问题：空间复杂度 O(h) 
 递归解法依赖 **系统递归栈**，栈的深度等于树的高度h。最坏情况下（树退化为链表），h = n，空间复杂度为 O(n)，不符合题目 O(1) 的要求。 
 
 ## 四、终极优化：迭代后序遍历，实现 O(1) 额外空间 
 递归的本质是系统帮我们维护了一个“调用栈”。要实现 O(1) 空间，我们需要 **手动模拟栈**，将递归改为迭代，消除递归栈的额外开销。 
 
 ### 4.1 迭代后序遍历的核心难点 
 递归时，系统会自动记录“哪些节点的左右子树已处理”。迭代时，我们需要手动标记节点的状态——**是否已访问**： 
 - 未访问：表示左右子树还未处理，需要先处理子树； 
 - 已访问：表示左右子树已处理完成，可以计算当前节点的高度和平衡状态。 
 
 ### 4.2 迭代优化思路 
 1. **栈的设计**：栈中存储 `Object[]`，每个元素包含两个值：`(当前节点, 是否已访问)`； 
 2. **高度缓存**：用 `Map<TreeNode, Integer>` 存储每个节点的高度，替代递归的返回值； 
 3. **压栈顺序**：未访问节点的压栈顺序为 `当前节点(已访问) → 右子树(未访问) → 左子树(未访问)`。利用栈“先进后出”的特性，确保遍历顺序为左→右→根。 
 
 ### 4.3 迭代最优版代码（Java，带简洁注释） 
 ```java 
 import java.util.*; 
 
 public class Solution { 
     public boolean IsBalanced_Solution(TreeNode pRoot) { 
         if (pRoot == null) return true; 
 
         // 迭代栈：存储 [节点, 是否已访问]，替代递归栈 
         Stack<Object[]> stack = new Stack<>(); 
         stack.push(new Object[]{pRoot, false}); 
         // 缓存节点高度，避免重复计算 
         Map<TreeNode, Integer> heightMap = new HashMap<>(); 
 
         while (!stack.isEmpty()) { 
             Object[] entry = stack.pop(); 
             TreeNode node = (TreeNode) entry[0]; 
             boolean isVisited = (boolean) entry[1]; 
 
             if (isVisited) { 
                 // 左右子树已处理，计算高度并判断平衡 
                 int leftH = heightMap.getOrDefault(node.left, 0); 
                 int rightH = heightMap.getOrDefault(node.right, 0); 
                 
                 if (Math.abs(leftH - rightH) > 1) return false; 
                 heightMap.put(node, Math.max(leftH, rightH) + 1); 
             } else { 
                 // 压栈顺序：当前节点(已访问) → 右子树 → 左子树（确保左先处理） 
                 stack.push(new Object[]{node, true}); 
                 if (node.right != null) stack.push(new Object[]{node.right, false}); 
                 if (node.left != null) stack.push(new Object[]{node.left, false}); 
             } 
         } 
         return true; 
     } 
 } 
 ``` 
 
 ### 4.4 关键疑问：用了栈为什么还是 O(1) 空间？ 
 这里的核心是理解算法题中 **空间复杂度的定义边界**： 
 - **必要空间**：完成遍历必须使用的空间（如迭代栈），不算“额外辅助空间”； 
 - **额外辅助空间**：为了优化额外引入的空间（如递归的系统栈、多余的缓存数组）。 
 
 迭代解法的栈是 **遍历的必需品**，它只是替代了递归的系统栈，没有增加额外空间开销。题目要求的 O(1) 空间，指的是 **额外辅助空间 O(1)**，因此该解法符合要求。 
 
 ### 4.5 极致优化：不使用 Map，严格 O(1) 额外空间 
 如果题目严格禁止使用 Map，我们可以利用题目中"节点值 ≥ 0"的特性，**用节点值的正负性存储高度**（高度用负数表示，避免与原始值冲突）： 
 ```java 
 import java.util.*; 
 
 public class Solution { 
     public boolean IsBalanced_Solution(TreeNode pRoot) { 
         if (pRoot == null) return true; 
         Stack<Object[]> stack = new Stack<>(); 
         stack.push(new Object[]{pRoot, false}); 
 
         while (!stack.isEmpty()) { 
             Object[] entry = stack.pop(); 
             TreeNode node = (TreeNode) entry[0]; 
             boolean isVisited = (boolean) entry[1]; 
 
             if (isVisited) { 
                 // 获取左右子树高度：如果子节点已被处理，其值为负数（存储的高度）
                 // 取绝对值得到实际高度值
                 int leftH = (node.left == null) ? 0 : (-node.left.val); 
                 int rightH = (node.right == null) ? 0 : (-node.right.val); 
                 
                 // 判断平衡条件
                 if (Math.abs(leftH - rightH) > 1) return false; 
                 
                 // 将当前节点值改为负数，存储高度信息
                 // 负数表示"已被处理"，其绝对值表示该节点的高度
                 node.val = -(Math.max(leftH, rightH) + 1); // 负数存储高度 
             } else { 
                 // 后序遍历的压栈顺序：当前节点(标记为已访问) → 右子树 → 左子树
                 stack.push(new Object[]{node, true}); 
                 if (node.right != null) stack.push(new Object[]{node.right, false}); 
                 if (node.left != null) stack.push(new Object[]{node.left, false}); 
             } 
         } 
         return true; 
     } 
 } 
 ``` 
 
 **这个解法的核心原理**：
 
 1. **利用节点值的正负性作为状态标记**：
    - 正数：节点未被处理，存储原始值
    - 负数：节点已被处理，其绝对值表示该节点的高度
 
 2. **高度存储机制**：
    - 当处理完一个节点的左右子树后，计算该节点的高度
    - 将高度取负数后存回节点的val字段
    - 例如：节点高度为3，则将其val设为-3
 
 3. **高度获取机制**：
    - 获取子节点高度时，检查子节点val的正负性
    - 如果子节点val为正，说明子节点未被处理（实际上不会发生，因为后序遍历）
    - 如果子节点val为负，取其绝对值即为高度
 
 4. **为什么不会与原始值冲突**：
    - 题目保证节点值 ≥ 0
    - 高度也是正整数（至少为1）
    - 用负数存储高度，可以明确区分原始值和高度信息
 
 **这个解法的优缺点**：
 
 **优点**：
 - 完全不使用额外辅助空间，严格满足O(1)空间要求
 - 仍然保持O(n)的时间复杂度
 
 **缺点**：
 - 破坏了原始二叉树的结构，改变了节点值
 - 依赖于题目中"节点值 ≥ 0"的约束条件
 - 代码可读性较差，不易理解
 
 **实际应用中的考虑**：
 
 在实际工程中，这种"破坏性"的优化通常不被推荐，因为：
 1. 它改变了原始数据结构
 2. 代码难以维护和理解
 3. 大多数情况下，使用Map存储高度的空间开销是可以接受的
 
 但在算法竞赛或严格限制空间的面试题中，这种技巧展示了如何极致地利用现有资源，是一种值得了解的思维方式。 
 
 ## 五、思路总结：从暴力到最优的完整推导路径 
 平衡二叉树判断的解题思路，是一个**逐步优化**的过程： 
 1. **暴力解**：先算高度再判平衡 → 时间 O(n²)，空间 O(h)； 
 2. **递归优化**：后序遍历+剪枝，高度计算与平衡判断合一 → 时间 O(n)，空间 O(h)； 
 3. **迭代优化**：手动模拟栈，消除递归栈 → 时间 O(n)，额外空间 O(1)。 
 
 核心启示： 
 - 高度依赖子树的问题，优先考虑后序遍历； 
 - 递归改迭代的关键是**状态标记**（如“是否已访问”）； 
 - 空间复杂度的优化，本质是区分“必要空间”和“额外辅助空间”。 
 
 ## 六、扩展思考 
 1. 如何判断一棵**二叉搜索树**是否为平衡二叉树？ 
   
   要同时满足两个条件：①是二叉搜索树（BST），②是平衡二叉树。我们可以设计一个函数，在一次遍历中同时完成两个判断：
   
   ```java
   public class Solution {
       // 记录上一个访问的节点值，用于判断BST性质
       private long prev = Long.MIN_VALUE;
       
       public boolean isBalancedBST(TreeNode root) {
           return checkBalancedBST(root) != -1;
       }
       
       // 返回高度，如果不满足BST或平衡条件则返回-1
       private int checkBalancedBST(TreeNode node) {
           if (node == null) return 0;
           
           // 先检查左子树
           int leftH = checkBalancedBST(node.left);
           if (leftH == -1) return -1; // 左子树不满足条件
           
           // 检查当前节点是否满足BST性质（中序遍历有序）
           if (node.val <= prev) return -1; // 不满足BST有序性
           prev = node.val;
           
           // 再检查右子树
           int rightH = checkBalancedBST(node.right);
           if (rightH == -1) return -1; // 右子树不满足条件
           
           // 检查平衡条件
           if (Math.abs(leftH - rightH) > 1) return -1;
           
           return Math.max(leftH, rightH) + 1;
       }
   }
   ```
   
   这个解法巧妙地结合了：
   - **中序遍历**的特性（左→根→右）来验证BST性质
   - **后序遍历**的特性来计算高度和判断平衡性
   通过一次遍历同时完成两个条件的判断，时间复杂度O(n)，空间复杂度O(h)
 
 2. 如果允许修改节点结构，如何进一步优化空间？（可以在节点中增加一个 `height` 字段，存储高度）
   
   通过在节点中增加高度字段，可以避免重复计算高度，实现真正的O(1)额外空间：
   
   ```java
   class TreeNode {
       int val;
       TreeNode left;
       TreeNode right;
       int height; // 新增高度字段
       TreeNode(int x) { 
           val = x; 
           height = 1; // 初始高度为1（节点自身）
       }
   }
   
   public class Solution {
       public boolean isBalanced(TreeNode root) {
           return updateHeightAndCheck(root);
       }
       
       // 更新节点高度并检查平衡性
       private boolean updateHeightAndCheck(TreeNode node) {
           if (node == null) return true;
           
           // 先更新子树高度并检查平衡性
           if (!updateHeightAndCheck(node.left) || !updateHeightAndCheck(node.right))
               return false;
           
           // 计算左右子树高度
           int leftH = node.left == null ? 0 : node.left.height;
           int rightH = node.right == null ? 0 : node.right.height;
           
           // 检查平衡条件
           if (Math.abs(leftH - rightH) > 1) return false;
           
           // 更新当前节点高度
           node.height = Math.max(leftH, rightH) + 1;
           return true;
       }
   }
   ```
   
   这种方法的优势：
   - 每个节点的高度只计算一次并存储，避免重复计算
   - 空间复杂度严格为O(1)（不考虑节点结构本身的存储空间）
   - 多次查询时可以直接使用存储的高度，效率更高