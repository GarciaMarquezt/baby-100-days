package com.baby100.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_gallery")
public class Gallery {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String imageUrl;
    /**
     * 缩略图地址（用于列表和预览）
     */
    private String thumbUrl;
    /**
     * 文件内容哈希（用于去重）
     */
    private String fileHash;
    /**
     * 类型：photo / video
     */
    private String category;

    /**
     * 展示分区（1=写真区一，2=写真区二，预留更多分区扩展）
     */
    private Integer zone;
    private Integer likes; // 点赞数
    /**
     * 置顶排序值，越大越靠前；未置顶为 0
     */
    private Integer sort;
    private LocalDateTime createTime;
}
