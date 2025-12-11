package com.baby100.controller.admin;

import com.baby100.common.Result;
import com.baby100.model.TableInfo;
import com.baby100.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/table")
public class AdminTableController {

    @Autowired
    private TableService tableService;

    @GetMapping("/list")
    public Result<List<TableInfo>> list() {
        return Result.success(tableService.list());
    }

    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody TableInfo tableInfo) {
        return Result.success(tableService.save(tableInfo));
    }
    
    @PostMapping("/update")
    public Result<Boolean> update(@RequestBody TableInfo tableInfo) {
        return Result.success(tableService.updateById(tableInfo));
    }
    
    @PostMapping("/delete")
    public Result<Boolean> delete(@RequestBody TableInfo tableInfo) {
        return Result.success(tableService.removeById(tableInfo.getId()));
    }
}

