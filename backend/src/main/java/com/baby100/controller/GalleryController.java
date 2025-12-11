package com.baby100.controller;

import com.baby100.common.Result;
import com.baby100.model.Gallery;
import com.baby100.service.GalleryService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/gallery")
public class GalleryController {

    @Autowired
    private GalleryService galleryService;

    @Value("${app.upload.dir:./uploads/}")
    private String uploadDir;

    // 获取列表（公开）
    @GetMapping("/list")
    public Result<List<Gallery>> list() {
        List<Gallery> list = galleryService.list(new LambdaQueryWrapper<Gallery>()
                .orderByDesc(Gallery::getSort)
                .orderByDesc(Gallery::getCreateTime));
        // 确保 likes 不为 null
        list.forEach(item -> {
            if (item.getLikes() == null) {
                item.setLikes(0);
            }
        });
        return Result.success(list);
    }

    /**
     * 分页获取列表（公开）
     */
    @GetMapping("/page")
    public Result<IPage<Gallery>> page(@RequestParam(defaultValue = "1") Integer page,
                                       @RequestParam(defaultValue = "20") Integer size) {
        Page<Gallery> pageParam = new Page<>(page, size);
        IPage<Gallery> result = galleryService.page(pageParam, new LambdaQueryWrapper<Gallery>()
                .orderByDesc(Gallery::getSort)
                .orderByDesc(Gallery::getCreateTime));
        return Result.success(result);
    }

    // 点赞接口
    @PostMapping("/like")
    public Result<Integer> like(@RequestParam Integer id) {
        Gallery gallery = galleryService.getById(id);
        if (gallery == null) {
            return Result.error(2001, "图片不存在");
        }
        if (gallery.getLikes() == null) {
            gallery.setLikes(0);
        }
        gallery.setLikes(gallery.getLikes() + 1);
        galleryService.updateById(gallery);
        return Result.success(gallery.getLikes());
    }

    /**
     * 图片代理接口 - 当直接访问图片URL失败时，通过此接口访问服务器文件
     * @param path 图片相对路径，例如：images/xxx.jpg 或 videos/xxx.mp4
     * @return 图片文件流
     */
    @GetMapping("/proxy")
    public ResponseEntity<Resource> proxyImage(@RequestParam String path) {
        try {
            // URL解码
            String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8.toString());
            
            // 构建完整文件路径
            String fullPath = uploadDir + decodedPath;
            File file = new File(fullPath);
            
            // 检查文件是否存在
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.notFound().build();
            }
            
            // 检查文件是否在上传目录内（防止路径遍历攻击）
            String canonicalPath = file.getCanonicalPath();
            String canonicalUploadDir = new File(uploadDir).getCanonicalPath();
            if (!canonicalPath.startsWith(canonicalUploadDir)) {
                return ResponseEntity.badRequest().build();
            }
            
            // 确定Content-Type
            String contentType = "application/octet-stream";
            String fileName = file.getName().toLowerCase();
            if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (fileName.endsWith(".png")) {
                contentType = "image/png";
            } else if (fileName.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (fileName.endsWith(".webp")) {
                contentType = "image/webp";
            } else if (fileName.endsWith(".mp4")) {
                contentType = "video/mp4";
            } else if (fileName.endsWith(".mov")) {
                contentType = "video/quicktime";
            }
            
            Resource resource = new FileSystemResource(file);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
