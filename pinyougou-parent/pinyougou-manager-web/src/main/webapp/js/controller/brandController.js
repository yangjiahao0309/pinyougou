 //控制层 
app.controller('brandController' ,function($scope,$controller ,brandService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		brandService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	};
	
	//分页
	$scope.findPage=function(page,size){
		brandService.findPage(page,size).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	};

	
	//查询实体 
	$scope.findOne=function(id){				
		brandService.findOne(id).success(
			function(response){
				$scope.entity= response;					
			}
		);				
	};
	
	//保存 
	$scope.save=function(){				
		var serviceObject;//服务层对象  				
		if($scope.entity.id!=null){//如果有ID
			serviceObject=brandService.update( $scope.entity ); //修改  
		}else{
			serviceObject=brandService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){
					//重新查询 
		        	$scope.reloadList();//重新加载
				}else{
					alert(response.message);
				}
			}		
		);				
	};
	
	 
	//批量删除 
	$scope.delete=function(){
		if(confirm("确定要删除吗？")) {
			//获取选中的复选框
			brandService.delete($scope.selectIds).success(
				function (response) {
					if (response.success) {
						$scope.reloadList();//刷新列表
						$scope.selectIds = [];
					}
				}
			);
		}
	};
	
	$scope.searchEntity={};//定义搜索对象 
	
	//条件查询
	$scope.search=function(page,size){
		brandService.search(page,size,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
    
});	
