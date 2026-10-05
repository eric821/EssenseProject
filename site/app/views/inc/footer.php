<footer>

</footer>

<div class="modal" id="theModal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="theModalHeader"></h4>
                <button type="button" class="close" id="closeTheModalModal" data-dismiss="modal">&times;</button>
            </div>
            <div class="container my-4">
                <div class="row">
                    <div id="theModalContent" class="col-md-12"></div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
<script src="<?php echo URLROOT; ?>/js/moment.js"></script>

<script type="text/javascript">
    $(document).ready(function()
    {
        // Get the current year for the copyright
        $('#year').text(new Date().getFullYear());
    });
</script>
</body>
</html>