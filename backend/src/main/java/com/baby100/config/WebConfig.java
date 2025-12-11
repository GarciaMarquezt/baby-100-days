package com.baby100.config;

import com.baby100.interceptor.LoginInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private LoginInterceptor loginInterceptor;

    @Value("${app.upload.dir:./uploads/}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(loginInterceptor)
//                .addPathPatterns("/api/admin/**"); // 拦截所有后台接口
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射上传文件访问路径
        // 将 /uploads/** 映射到本地 uploads 目录
        File uploadDirFile = new File(uploadDir);
        String absolutePath = uploadDirFile.getAbsolutePath();
        // 确保路径以 / 结尾
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }
        // Windows路径需要转换为file:///格式
        String fileUrl = "file:" + absolutePath.replace("\\", "/");
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileUrl);
    }
}
