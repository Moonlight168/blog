// docs/.vuepress/utils/sidebarGenerator.js
import { getDirname, path } from "@vuepress/utils";
import fs from "fs/promises";
import yaml from "js-yaml"; // 需安装：npm i js-yaml -D

// 获取当前文件目录（用于路径计算）
const __dirname = getDirname(import.meta.url);

/**
 * 解析文件信息并提取frontmatter
 * @param {string} filePath 文件路径
 * @param {string} rootDir 根目录路径
 * @returns {Promise<Object|null>} 文件信息对象或null
 */
async function parseFileInfo(filePath, rootDir) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
    if (!frontmatterMatch) return null;

    const frontmatter = yaml.load(frontmatterMatch[1]);
    if (!frontmatter.title || !frontmatter.date) return null;

    // 计算相对路径（相对于根目录）
    const relativePath = path.relative(rootDir, filePath);
    
    return {
      title: frontmatter.title,
      date: new Date(frontmatter.date),
      path: relativePath,
      filePath: filePath,
      order: frontmatter.order !== undefined ? Number(frontmatter.order) : Infinity, // 获取order字段，如果没有则设为Infinity
      icon: frontmatter.icon // 获取icon字段
    };
  } catch (error) {
    console.error(`解析文件失败: ${filePath}`, error);
    return null;
  }
}

/**
 * 递归构建目录结构
 * @param {string} dir 当前目录
 * @param {string} rootDir 根目录
 * @returns {Promise<Object>} 目录结构对象
 */
async function buildDirectoryStructure(dir, rootDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const structure = {
    files: [],
    subdirs: {},
    dirInfo: null // 用于存储目录信息，如order和icon
  };

  // 首先尝试查找目录的README.md文件，提取目录的order和icon信息
  const readmePath = path.join(dir, 'README.md');
  try {
    const readmeContent = await fs.readFile(readmePath, 'utf-8');
    const frontmatterMatch = readmeContent.match(/^---\s*([\s\S]*?)\s*---/);
    if (frontmatterMatch) {
      const frontmatter = yaml.load(frontmatterMatch[1]);
      structure.dirInfo = {
        order: frontmatter.order !== undefined ? Number(frontmatter.order) : Infinity,
        icon: frontmatter.icon
      };
    }
  } catch (error) {
    // README.md不存在或读取失败，使用默认值
    structure.dirInfo = {
      order: Infinity,
      icon: "folder"
    };
  }

  // 首先处理所有文件
  for (const entry of entries) {
    const fullPath = path.resolve(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") {
      const fileInfo = await parseFileInfo(fullPath, rootDir);
      if (fileInfo) {
        structure.files.push(fileInfo);
      }
    }
  }

  // 然后递归处理子目录
  for (const entry of entries) {
    const fullPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      structure.subdirs[entry.name] = await buildDirectoryStructure(fullPath, rootDir);
    }
  }

  // 对当前目录的文件按order升序排序，order相同时按时间倒序排序
  structure.files.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return b.date.getTime() - a.date.getTime();
  });

  return structure;
}

/**
 * 将目录结构转换为VuePress侧边栏配置
 * @param {Object} structure 目录结构对象
 * @param {string} basePath 基础路径
 * @returns {Array} 侧边栏配置数组
 */
function convertToSidebarConfig(structure, basePath = "") {
  const sidebarItems = [];

  // 添加当前目录的文件
  structure.files.forEach(file => {
    const fileConfig = {
      text: file.title,
      link: `/blogs/${file.path}`
    };
    // 如果文件有icon，添加icon
    if (file.icon) {
(fileConfig as any).icon = file.icon;
    }
    sidebarItems.push(fileConfig);
  });

  // 创建目录项数组，包含目录名和结构信息
  const dirItems = Object.keys(structure.subdirs).map(dirName => ({
    name: dirName,
    structure: structure.subdirs[dirName]
  }));

  // 按order升序排序目录，order相同时按名称字母顺序排序
  dirItems.sort((a, b) => {
    if (a.structure.dirInfo?.order !== b.structure.dirInfo?.order) {
      return (a.structure.dirInfo?.order || Infinity) - (b.structure.dirInfo?.order || Infinity);
    }
    return a.name.localeCompare(b.name);
  });

  // 添加排序后的子目录
  dirItems.forEach(dirItem => {
    const subdirStructure = dirItem.structure;
    const subdirPath = basePath ? `${basePath}/${dirItem.name}` : dirItem.name;
    const subdirConfig = convertToSidebarConfig(subdirStructure, subdirPath);
    
    // 只有当子目录有内容时才添加
    if (subdirConfig.length > 0) {
      const dirConfig = {
        text: dirItem.name,
        icon: subdirStructure.dirInfo?.icon || "folder", // 使用目录的icon或默认folder图标
        collapsible: true,
        children: subdirConfig
      };
      sidebarItems.push(dirConfig);
    }
  });

  console.log(`转换目录结构为侧边栏配置，基础路径：${basePath}，侧边栏项：${JSON.stringify(sidebarItems)}`);
  return sidebarItems;
}

/**
 * 生成带有目录结构的博客侧边栏
 * @returns {Promise<Array>} 侧边栏配置数组
 */
export async function getBlogsSidebar() {
  const blogsRootDir = path.resolve(__dirname, "../../blogs"); // 博客根目录（docs/blogs）
  
  try {
    // 构建目录结构
    const directoryStructure = await buildDirectoryStructure(blogsRootDir, blogsRootDir);
    
    // 转换为侧边栏配置
    const sidebarItems = convertToSidebarConfig(directoryStructure);
    
    return [
      {
        text: "我的博客",
        icon: "book",
        collapsible: true,
        children: sidebarItems
      }
    ];
  } catch (error) {
    console.error("生成博客侧边栏失败:", error);
    return [];
  }
}
