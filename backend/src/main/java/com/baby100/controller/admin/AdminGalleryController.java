package com.baby100.controller.admin;

import com.baby100.common.Result;
import com.baby100.model.Gallery;
import com.baby100.service.GalleryService;
import com.baby100.service.SftpService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/gallery")
public class AdminGalleryController {

    @Autowired
    private GalleryService galleryService;

    @Autowired
    private SftpService sftpService;

    // 从配置文件读取上传路径和域名
    @Value("${app.upload.dir:./uploads/}")
    private String uploadDir;

    @Value("${app.upload.domain:/uploads/}")
    private String uploadDomain;

    @GetMapping("/list")
    public Result<IPage<Gallery>> list(@RequestParam(defaultValue = "1") Integer page,
                                       @RequestParam(defaultValue = "20") Integer size) {
        Page<Gallery> pageParam = new Page<>(page, size);
        return Result.success(galleryService.page(pageParam, new LambdaQueryWrapper<Gallery>()
                .orderByDesc(Gallery::getSort)
                .orderByDesc(Gallery::getCreateTime)));
    }

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return Result.error(1001, "文件为空");

        String fileName = file.getOriginalFilename();
        String suffix = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
        String newName = UUID.randomUUID().toString() + suffix;

        // 判断是否是视频
        boolean isVideo = suffix.endsWith(".mp4") || suffix.endsWith(".mov") || suffix.endsWith(".avi") || suffix.endsWith(".webm");
        String subDir = isVideo ? "videos/" : "images/";
        String category = isVideo ? "video" : "photo";

        try {
            // 构建完整的上传路径
            String fullUploadPath = uploadDir + subDir;
            String remoteFilePath = fullUploadPath; // SFTP远程路径

            // 如果启用了SFTP，通过SFTP上传到远程服务器
            if (sftpService.isEnabled()) {
                try {
                    sftpService.uploadFile(file.getInputStream(), remoteFilePath, newName);
                } catch (Exception e) {
                    e.printStackTrace();
                    return Result.error(500, "SFTP上传失败: " + e.getMessage());
                }
            } else {
                // 本地文件系统上传（如果Java应用部署在服务器上）
                Path uploadPath = Paths.get(fullUploadPath);
                
                // 确保目录存在
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // 保存文件
                File dest = new File(fullUploadPath + newName);
                file.transferTo(dest);
            }

            // 构建访问URL
            String url;
            if (uploadDomain.startsWith("http")) {
                // 完整域名
                url = uploadDomain + subDir + newName;
            } else {
                // 相对路径，需要确保以/开头
                String domain = uploadDomain.endsWith("/") ? uploadDomain : uploadDomain + "/";
                url = domain + subDir + newName;
            }

            // 保存到数据库
            Gallery gallery = new Gallery();
            gallery.setImageUrl(url);
            gallery.setCategory(category);
            gallery.setCreateTime(LocalDateTime.now());
            gallery.setSort(0);
            galleryService.save(gallery);

            return Result.success(url);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error(500, "上传失败: " + e.getMessage());
        }
    }

    @PostMapping("/delete")
    public Result<Boolean> delete(@RequestBody Gallery gallery) {
        // TODO: 最好也删除物理文件
        return Result.success(galleryService.removeById(gallery.getId()));
    }

    /**
     * 置顶/取消置顶
     * @param id 图片ID
     * @param pinned true 表示置顶，false 表示取消置顶
     */
    @PostMapping("/pin")
    public Result<Boolean> pin(@RequestParam Integer id, @RequestParam Boolean pinned) {
        Gallery gallery = galleryService.getById(id);
        if (gallery == null) {
            return Result.error(2001, "图片不存在");
        }

        if (Boolean.TRUE.equals(pinned)) {
            // 找到当前最大的 sort，并在其基础上 +1
            LambdaQueryWrapper<Gallery> wrapper = new LambdaQueryWrapper<>();
            wrapper.orderByDesc(Gallery::getSort).last("LIMIT 1");
            Gallery top = galleryService.getOne(wrapper);
            int nextSort = (top != null && top.getSort() != null ? top.getSort() : 0) + 1;
            gallery.setSort(nextSort);
        } else {
            // 取消置顶
            gallery.setSort(0);
        }

        galleryService.updateById(gallery);
        return Result.success(true);
    }
}

