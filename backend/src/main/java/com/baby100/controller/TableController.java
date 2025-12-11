package com.baby100.controller;

import com.baby100.common.Result;
import com.baby100.model.TableInfo;
import com.baby100.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/table")
public class TableController {

    @Autowired
    private TableService tableService;

    // 公开查询（如果允许宾客查看座位）
    @GetMapping("/list")
    public Result<List<TableInfo>> list() {
        return Result.success(tableService.list());
    }
}
